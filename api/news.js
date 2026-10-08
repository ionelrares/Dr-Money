const feeds=[
  {url:'https://www.profit.ro/stiri/economie/rss',source:'Profit.ro'},
  {url:'https://rss.hotnews.ro/rss/economie',source:'HotNews'},
  {url:'https://news.google.com/rss/search?q='+encodeURIComponent('Romania finanțe personale dobânzi credite inflație taxe')+'&hl=ro&gl=RO&ceid=RO:ro',source:'Google News'}
];

function clean(s=''){
  return s
    .replace(/<!\[CDATA\[/g,'')
    .replace(/\]\]>/g,'')
    .replace(/<[^>]*>/g,' ')
    .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&nbsp;/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}
function getTag(block,tag){
  const m=block.match(new RegExp('<'+tag+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+tag+'>','i'));
  return m?clean(m[1]):'';
}
function parseItems(xml,source){
  return [...xml.matchAll(/<item(?:\\s[^>]*)?>([\\s\\S]*?)<\\/item>/gi)].map(m=>{
    const b=m[1];
    return {
      title:getTag(b,'title'),
      url:getTag(b,'link'),
      date:getTag(b,'pubDate')||getTag(b,'published'),
      summary:clean(getTag(b,'description')).slice(0,240),
      source:getTag(b,'source')||source
    };
  });
}
function relevant(x){
  const t=(x.title+' '+x.summary).toLowerCase();
  return /românia|romania|bnr|dobân|doban|infla|tax|salari|pensie|pension|credit|ipotec|euro|leu|energie|carbur|preț|pret|cost|investi|burs|econom|venit|consum|șomaj|somaj|tva|anaf|asf/.test(t);
}
module.exports=async function(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const results=await Promise.allSettled(feeds.map(async feed=>{
    const r=await fetch(feed.url,{headers:{'User-Agent':'Dr-Money/1.0'}});
    if(!r.ok)throw new Error('RSS unavailable');
    return parseItems(await r.text(),feed.source);
  }));
  const all=results.flatMap(x=>x.status==='fulfilled'?x.value:[]);
  const seen=new Set();
  const items=all
    .filter(x=>x.title&&x.url&&relevant(x))
    .filter(x=>{
      const key=x.title.toLowerCase().replace(/\W+/g,' ').trim();
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    })
    .sort((a,b)=>new Date(b.date||0)-new Date(a.date||0))
    .slice(0,6);
  if(!items.length)return res.status(502).json({error:'Nu am găsit noutăți disponibile momentan.'});
  return res.status(200).json({items,updatedAt:new Date().toISOString()});
};