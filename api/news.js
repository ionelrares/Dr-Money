const queries=[
  'Romania finante personale dobânzi credite inflație taxe',
  'Romania BNR dobânda inflație economie',
  'Romania investiții pensii salarii energie prețuri'
];

function stripHtml(s=''){return s.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'\"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\\s+/g,' ').trim()}
function decode(s=''){return stripHtml(s)}
function getTag(block,tag){const m=block.match(new RegExp('<'+tag+'[^>]*>([\\s\\S]*?)</'+tag+'>','i'));return m?decode(m[1]):''}
function parseItems(xml){
  return [...xml.matchAll(/<item>([\\s\\S]*?)<\\/item>/gi)].map(m=>{
    const b=m[1];
    return {title:getTag(b,'title'),url:getTag(b,'link'),date:getTag(b,'pubDate'),summary:getTag(b,'description'),source:getTag(b,'source')};
  });
}
module.exports=async function(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  try{
    const results=await Promise.all(queries.map(async q=>{
      const url='https://news.google.com/rss/search?q='+encodeURIComponent(q)+'&hl=ro&gl=RO&ceid=RO:ro';
      const r=await fetch(url,{headers:{'User-Agent':'Dr-Money/1.0'}});
      if(!r.ok)throw new Error('RSS unavailable');
      return parseItems(await r.text());
    }));
    const seen=new Set();
    const items=results.flat().filter(x=>x.title&&x.url).filter(x=>{
      const key=x.title.toLowerCase().replace(/\\W+/g,' ').trim();
      if(seen.has(key))return false; seen.add(key); return true;
    }).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6);
    return res.status(200).json({items,updatedAt:new Date().toISOString()});
  }catch(e){
    return res.status(502).json({error:'Nu am putut încărca noutățile.'});
  }
};