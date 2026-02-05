 import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
 import { getCurrentUserId } from '@/lib/auth';
 
 export interface OcdMoment {
   id?: string;
   user_id?: string | null;
   activity_type: string;
   duration_seconds?: number;
   completed_at?: string;
   created_at?: string;
   metadata?: Record<string, unknown>;
 }
 
 /**
  * Insert a new OCD moment into the database.
  * Automatically includes user_id if available.
  */
 export async function insertOcdMoment(moment: Omit<OcdMoment, 'id' | 'user_id' | 'created_at'>): Promise<OcdMoment | null> {
   if (!isSupabaseConfigured() || !supabase) {
     console.log('Demo mode: skipping database insert', moment);
     return null;
   }
 
   const userId = getCurrentUserId();
   
   const { data, error } = await supabase
     .from('ocd_moments')
     .insert({
       ...moment,
       user_id: userId, // Include user_id if available, null otherwise
     })
     .select()
     .single();
 
   if (error) {
     console.error('Error inserting OCD moment:', error);
     return null;
   }
 
   return data;
 }
 
 /**
  * Fetch OCD moments from the database.
  * Filters by user_id if available, otherwise returns all (demo mode).
  */
 export async function fetchOcdMoments(limit = 50): Promise<OcdMoment[]> {
   if (!isSupabaseConfigured() || !supabase) {
     console.log('Demo mode: returning empty array for fetch');
     return [];
   }
 
   const userId = getCurrentUserId();
   
   let query = supabase
     .from('ocd_moments')
     .select('*')
     .order('created_at', { ascending: false })
     .limit(limit);
 
   // Filter by user_id if available
   if (userId) {
     query = query.eq('user_id', userId);
   }
 
   const { data, error } = await query;
 
   if (error) {
     console.error('Error fetching OCD moments:', error);
     return [];
   }
 
   return data || [];
 }
 
 /**
  * Fetch OCD moments for a specific activity type.
  */
 export async function fetchOcdMomentsByType(activityType: string, limit = 50): Promise<OcdMoment[]> {
   if (!isSupabaseConfigured() || !supabase) {
     console.log('Demo mode: returning empty array for fetch by type');
     return [];
   }
 
   const userId = getCurrentUserId();
   
   let query = supabase
     .from('ocd_moments')
     .select('*')
     .eq('activity_type', activityType)
     .order('created_at', { ascending: false })
     .limit(limit);
 
   if (userId) {
     query = query.eq('user_id', userId);
   }
 
   const { data, error } = await query;
 
   if (error) {
     console.error('Error fetching OCD moments by type:', error);
     return [];
   }
 
   return data || [];
 }