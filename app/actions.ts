'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

// Terminal-specific actions (return messages instead of redirecting)

export async function terminalSignup(email: string, password: string, username: string) {
  'use server'
  
  try {
    const supabase = await createClient()
    
    // Sign up the user with metadata
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    })

    if (signUpError) {
      return { success: false, message: signUpError.message }
    }

    if (!authData.user) {
      return { success: false, message: 'Failed to create user' }
    }

    // The profile will be created automatically by the trigger
    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 500))

    return { success: true, message: 'Account created! Logged In!' }
  } catch (error) {
    console.error('Unexpected error in terminalSignup:', error)
    return { success: false, message: 'An unexpected error occurred' }
  }
}

export async function terminalLogin(username: string, password: string) {
  try {
    const supabase = await createClient()
    
    // Look up the user by username in the profiles table and get their email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username)
      .single()
    
    if (profileError) {
      console.error('Profile lookup error:', profileError)
      return { success: false, message: `Error finding username: ${profileError.message}` }
    }
    
    if (!profile || !profile.email) {
      return { success: false, message: 'Username not found.' }
    }
    
    console.log('Found user with email:', profile.email)
    
    // Now authenticate with the email we found
    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    })
    
    if (error) {
      console.error('Authentication error:', error)
      return { success: false, message: `Login failed: ${error.message}` }
    }
    
    return { success: true, message: `Welcome back, ${username}!`, user: data.user }
  } catch (error) {
    console.error('Unexpected error in terminalLogin:', error)
    return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function terminalLogout() {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { success: false, message: `Logout failed: ${error.message}` }
    }
    
    return { success: true, message: 'Logged out successfully.' }
  } catch (error) {
    return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function terminalWhoami() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { success: false, message: 'Not logged in.' }
    }
    
    return { 
      success: true, 
      message: 'User info retrieved.',
      user: {
        email: user.email,
        id: user.id,
        created_at: user.created_at,
      }
    }
  } catch (error) {
    return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function terminalAddNote(title: string, content: string) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, message: 'Authentication required. Please login first.' }
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([{ title, content, user_id: user.id }])
      .select()
    
    if (error) {
      return { success: false, message: `Error: ${error.message}` }
    }
    
    return { success: true, message: `Note "${title}" created successfully!`, data }
  } catch (error) {
    return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function terminalUpdateNote(noteId: string, title: string, content: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, message: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('notes')
    .update({ 
      title, 
      content,
      updated_at: new Date().toISOString()
    })
    .eq('id', noteId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating note:', error);
    return { success: false, message: 'Failed to update note' };
  }

  return { success: true, message: 'Note updated successfully' };
}

export async function terminalListNotes() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, message: 'Authentication required. Please login first.' }
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      return { success: false, message: `Error: ${error.message}` }
    }
    
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function terminalDeleteNote(identifier: string) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, message: 'Authentication required. Please login first.' }
    }

    // Get the note by ID or title to confirm it exists
    const noteResult = await findNoteByIdOrTitle(identifier, user.id)
    
    if (!noteResult.success || !noteResult.data) {
      return { success: false, message: noteResult.message || 'Note not found.' }
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteResult.data.id)
      .eq('user_id', user.id)
    
    if (error) {
      return { success: false, message: `Error: ${error.message}` }
    }
    
    return { success: true, message: `Note "${noteResult.data.title}" deleted successfully!` }
  } catch (error) {
    return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

// Helper function to find a note by ID or title
async function findNoteByIdOrTitle(identifier: string, userId: string) {
  const supabase = await createClient()
  
  // First, try to find by ID
  let { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', identifier)
    .eq('user_id', userId)
    .single()
  
  // If not found by ID, try to find by title (case-insensitive)
  if (error || !note) {
    const { data: notes, error: titleError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .ilike('title', identifier)
    
    if (titleError || !notes || notes.length === 0) {
      return { success: false, message: `Note not found with ID or title: "${identifier}"` }
    }
    
    // If multiple notes match, return the first one (or we could return all matches)
    if (notes.length > 1) {
      return { 
        success: false, 
        message: `Multiple notes found with title "${identifier}". Please use ID instead. Matching notes: ${notes.map(n => `${n.id} - "${n.title}"`).join(', ')}`
      }
    }
    
    note = notes[0]
  }
  
  return { success: true, data: note }
}

export async function terminalAddListNote(title: string) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, message: 'Authentication required. Please login first.' }
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([{ 
        title, 
        content: '', 
        user_id: user.id,
        is_list: true,
        list_items: []
      }])
      .select()
    
    if (error) {
      return { success: false, message: `Error: ${error.message}` }
    }
    
    return { success: true, message: `List "${title}" created successfully!`, data }
  } catch (error) {
    return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function terminalAddListItem(noteIdentifier: string, itemText: string) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, message: 'Authentication required. Please login first.' }
    }

    // Get the current note by ID or title
    const noteResult = await findNoteByIdOrTitle(noteIdentifier, user.id)
    
    if (!noteResult.success || !noteResult.data) {
      return { success: false, message: noteResult.message || 'Note not found.' }
    }
    
    const note = noteResult.data

    if (!note.is_list) {
      return { success: false, message: 'This note is not a list. Use regular note commands.' }
    }

    // Add new item to the list
    const currentItems = note.list_items || []
    const newItems = [...currentItems, { text: itemText, checked: false }]

    const { error: updateError } = await supabase
      .from('notes')
      .update({ list_items: newItems })
      .eq('id', note.id)
      .eq('user_id', user.id)
    
    if (updateError) {
      return { success: false, message: `Error: ${updateError.message}` }
    }
    
    return { success: true, message: `Item added to list! (Item #${newItems.length})` }
  } catch (error) {
    return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function terminalToggleListItem(noteIdentifier: string, itemIndex: number) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, message: 'Authentication required. Please login first.' }
    }

    // Get the current note by ID or title
    const noteResult = await findNoteByIdOrTitle(noteIdentifier, user.id)
    
    if (!noteResult.success || !noteResult.data) {
      return { success: false, message: noteResult.message || 'Note not found.' }
    }
    
    const note = noteResult.data

    if (!note.is_list) {
      return { success: false, message: 'This note is not a list.' }
    }

    const items = note.list_items || []
    
    if (itemIndex < 0 || itemIndex >= items.length) {
      return { success: false, message: `Invalid item number. Must be between 1 and ${items.length}.` }
    }

    // Toggle the checked status
    items[itemIndex].checked = !items[itemIndex].checked

    const { error: updateError } = await supabase
      .from('notes')
      .update({ list_items: items })
      .eq('id', note.id)
      .eq('user_id', user.id)
    
    if (updateError) {
      return { success: false, message: `Error: ${updateError.message}` }
    }
    
    const status = items[itemIndex].checked ? 'checked' : 'unchecked'
    return { success: true, message: `Item ${itemIndex + 1} ${status}!` }
  } catch (error) {
    return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function terminalViewNote(noteIdentifier: string) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, message: 'Authentication required. Please login first.' }
    }

    // Get the note by ID or title
    const noteResult = await findNoteByIdOrTitle(noteIdentifier, user.id)
    
    if (!noteResult.success || !noteResult.data) {
      return { success: false, message: noteResult.message || 'Note not found.' }
    }
    
    return { success: true, data: noteResult.data }
  } catch (error) {
    return { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

// Original auth actions (keep these for web UI)

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = email.split('@')[0] // Extract username from email

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      }
    }
  })

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}