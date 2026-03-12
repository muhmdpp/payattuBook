const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: members } = await supabase.from('members').select('*').ilike('name_ml', '%മലയാളി%').or('name.ilike.%malayali%');
    if (!members || members.length === 0) {
        const { data: members2 } = await supabase.from('members').select('*').ilike('name', '%malayali%');
        if (!members2 || members2.length === 0) return console.log("not found");
        getTx(members2[0]);
    } else {
        getTx(members[0]);
    }

    async function getTx(member) {
        const { data: txs } = await supabase
            .from('transactions')
            .select('*')
            .or(`giver_id.eq.${member.id},receiver_id.eq.${member.id}`);
        fs.writeFileSync('output.json', JSON.stringify(txs, null, 2));
    }
}
check();
