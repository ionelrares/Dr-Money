const crypto = require('crypto');

function json(res,status,payload){
  res.status(status).setHeader('Content-Type','application/json');
  res.end(JSON.stringify(payload));
}
function validEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
async function supabase(path, options={}){
  const base=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!base||!key) throw new Error('Newsletter backend is not configured.');
  const r=await fetch(base+'/rest/v1/'+path,{
    ...options,
    headers:{
      apikey:key,
      Authorization:'Bearer '+key,
      'Content-Type':'application/json',
      Prefer:'return=representation',
      ...(options.headers||{})
    }
  });
  const text=await r.text();
  let data=null; try{data=text?JSON.parse(text):null}catch{}
  if(!r.ok) throw new Error(data?.message||'Database request failed.');
  return data;
}
async function sendEmail({to,subject,html}){
  const key=process.env.RESEND_API_KEY;
  const from=process.env.RESEND_FROM_EMAIL;
  if(!key||!from) throw new Error('Email backend is not configured.');
  const r=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
    body:JSON.stringify({from,to,subject,html})
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data?.message||'Email request failed.');
  return data;
}

module.exports=async(req,res)=>{
  if(req.method==='GET'){
    const token=String(req.query?.token||'');
    if(!token) return res.status(400).send('Link de confirmare invalid.');
    try{
      const rows=await supabase('newsletter_subscribers?select=id,email&confirmation_token=eq.'+encodeURIComponent(token)+'&status=eq.pending&limit=1');
      if(!rows?.length) return res.status(400).send('<h1>Link invalid sau expirat</h1><p>Nu am găsit o înscriere care să poată fi confirmată.</p>');
      await supabase('newsletter_subscribers?id=eq.'+encodeURIComponent(rows[0].id),{
        method:'PATCH',
        body:JSON.stringify({status:'confirmed',confirmed_at:new Date().toISOString(),confirmation_token:null})
      });
      res.status(200).send('<!doctype html><html lang="ro"><meta charset="utf-8"><title>Newsletter confirmat</title><style>body{font:16px system-ui;max-width:620px;margin:80px auto;padding:20px;color:#101828}a{color:#155eef}</style><h1>Înscriere confirmată ✓</h1><p>Adresa ta a fost confirmată. Vei primi newsletterul Dr. Money la această adresă.</p><p><a href="/">Înapoi la Dr. Money</a></p></html>');
    }catch(e){res.status(500).send('Nu am putut confirma înscrierea. Încearcă din nou mai târziu.');}
    return;
  }
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  try{
    const email=String(req.body?.email||'').trim().toLowerCase();
    if(!validEmail(email)) return json(res,400,{error:'Introdu o adresă de email validă.'});
    const token=crypto.randomUUID();
    const existing=await supabase('newsletter_subscribers?select=id,status&email=eq.'+encodeURIComponent(email)+'&limit=1');
    if(existing?.length && existing[0].status==='confirmed'){
      return json(res,200,{ok:true,message:'Ești deja înscris la newsletter.'});
    }
    if(existing?.length){
      await supabase('newsletter_subscribers?id=eq.'+encodeURIComponent(existing[0].id),{
        method:'PATCH',
        body:JSON.stringify({status:'pending',confirmation_token:token,updated_at:new Date().toISOString()})
      });
    }else{
      await supabase('newsletter_subscribers',{
        method:'POST',
        body:JSON.stringify({email,status:'pending',confirmation_token:token})
      });
    }
    const origin=req.headers.origin||('https://'+req.headers.host);
    const confirmationUrl=origin+'/api/newsletter?token='+encodeURIComponent(token);
    await sendEmail({
      to:email,
      subject:'Confirmă înscrierea la newsletterul Dr. Money',
      html:'<div style="font-family:Arial,sans-serif;line-height:1.6;color:#101828;max-width:600px"><h2>Confirmă înscrierea la Dr. Money</h2><p>Ai cerut să primești newsletterul Dr. Money.</p><p>Apasă butonul de mai jos pentru a confirma înscrierea:</p><p><a href="'+confirmationUrl+'" style="display:inline-block;background:#101828;color:#fff;text-decoration:none;padding:12px 18px;border-radius:9px">Confirmă înscrierea →</a></p><p style="font-size:13px;color:#667085">Dacă nu ai cerut această înscriere, poți ignora acest email.</p></div>'
    });
    return json(res,200,{ok:true});
  }catch(e){
    return json(res,500,{error:'Înscrierea nu este încă disponibilă. Backend-ul newsletterului trebuie configurat.'});
  }
};