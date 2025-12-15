import os
from supabase import create_client, Client

class SupabaseDB:
    def __init__(self):
        # Support both standard identifiers and Next.js public/service role keys
        url: str = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        # Fallback to custom_env.py if available (dev hack)
        if not url or not key:
            try:
                import sys
                sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                from custom_env import SUPABASE_URL, SUPABASE_KEY
                url = url or SUPABASE_URL
                key = key or SUPABASE_KEY
            except ImportError:
                pass

        if not url or not key:
            raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.")
            
        self.client: Client = create_client(url, key)

    def upsert_court(self, court_data: dict) -> str:
        """
        Calls the PostgreSQL RPC function 'upsert_court_from_scrape'
        Returns the Court UUID.
        """
        try:
            response = self.client.rpc('upsert_court_from_scrape', {'p': court_data}).execute()
            if hasattr(response, 'data'):
                return response.data
            return response
        except Exception as e:
            print(f"Error upserting court: {e}")
            return None

    def get_source_id(self, source_name: str, source_type: str = 'municipal', base_url: str = None) -> str:
        """
        Ensures a source exists and returns its ID.
        """
        # check if exists
        res = self.client.table('sources').select('id').eq('name', source_name).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]['id']
        
        # create if not
        payload = {
            'name': source_name,
            'source_type': source_type,
            'base_url': base_url
        }
        res = self.client.table('sources').insert(payload).execute()
        return res.data[0]['id']

# Singleton instance access pattern if needed, but class usage is fine.
