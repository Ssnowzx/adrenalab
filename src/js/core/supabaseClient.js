
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configurações do Supabase
// Projeto: AdrenaSKT
const SUPABASE_URL = 'https://gdaqzqnaluuarmeoqziz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6UqKX7Lxp4cdhXKvxjHMqg_e_WhSV0y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
