from bs4 import BeautifulSoup
import time, calendar, os, sys
import pandas

def ordinal(n):
    '''Integer to ordinal for 1-100'''
    if 10 < n < 14: return u'%sth' % n
    if n % 10 == 1: return u'%sst' % n
    if n % 10 == 2: return u'%snd' % n
    if n % 10 == 3: return u'%srd' % n
    return u'%sth' % n

# Let's find what directory we're in
syspath = os.path.dirname(sys.argv[0])
fullpath = os.path.abspath(syspath)

# Get all the subdirectories in the current directory
dirlist=[]
allfiles=os.listdir(fullpath)
for filename in allfiles:
    if "." not in filename and filename not in ["Archive","jsLibs","AboutConor"]:
        dirlist.append(filename)

urls=[]
titles=[]
times=[]
datetimes=[]

for dirname in dirlist:
    # Build URL
    url="http://cnr.lwlss.net/"+dirname
    # Open index.html
    index=open(os.path.join(fullpath,dirname,"index.html"),"r")
    inddoc=index.read()
    indsoup=BeautifulSoup(inddoc)
    #newsoup.body.clear()
    #newsoup.head.clear()
    #indsoup.head.title.extract()

    # Get human-readable time
    try:
        timetag=indsoup.body.header.time.extract()
    except:
        timetag=BeautifulSoup('<time datetime="9999-01-01T00:00:00Z">999 No Time Recorded</time>')
        timetag.attrs["datetime"]="9999-01-01T00:00:00Z"
        timetag.contents[0]="999 No Time Recorded"

    datetimes.append(timetag.attrs["datetime"])
    times.append(timetag.contents[0])
    
    # Get h1 element from header in body
    try:
        title=indsoup.body.header.h1.extract()
        titles.append(title.contents[0])
    except:
        titles.append("zZzZz... No title")
    urls.append(url)
    
    # Generate HTML5 time tag with nice human readable text
    currtim=time.localtime()
    GMT=time.gmtime()

pagedata=pandas.DataFrame(dirlist,columns=["Directory"])
pagedata["URL"]=urls
pagedata["Title"]=titles
pagedata["Time"]=times
pagedata["Datetime"]=datetimes

# Sort as you like...
pagedata.sort(columns=["Datetime","Title"],inplace=True,ascending=False)

pagedata.index=range(0,len(pagedata["URL"]))

headerString='''
<!DOCTYPE doctype html>

<html lang="en">
<head><title>Archive (alphabetical order)</title>
<meta charset="utf-8">

<meta content="" name="description"/>
<link href="../CLstyle.css" rel="stylesheet" type="text/css">
<link href="http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800" rel="stylesheet" type="text/css">
</link></link></meta></head>
<body><header><h1>Archive</h1></header>
<article>

<p>Articles sorted by title <a href="byname.html">here</a>.  Alternatively <a href="http://cnr.lwlss.net">go home</a>.</p>

<ul>
'''

listString=''''''

for i in xrange(0,len(pagedata.URL)):
    line='<li><a href="'+pagedata.URL[i]+'">'+pagedata.Title[i]+' </a>'+pagedata.Time[i]+'\n'
    listString+=line
    
tailString='''</ul>

<div id="cse" style="width: 25%;">Loading</div>
<script src="http://www.google.com/jsapi" type="text/javascript"></script>
<script type="text/javascript"> 
  google.load('search', '1', {language : 'en', style : google.loader.themes.MINIMALIST});
  google.setOnLoadCallback(function() {
    var customSearchOptions = {};  var customSearchControl = new google.search.CustomSearchControl(
      '006329004553662584378:az6bswtkuhq', customSearchOptions);
    customSearchControl.setResultSetSize(google.search.Search.FILTERED_CSE_RESULTSET);
    customSearchControl.draw('cse');
  }, true);
</script>

</article>
</body>
</html>
'''

archiveFile=open("Archive/index.html","w")
archiveFile.write(headerString+listString+tailString)
archiveFile.close()

# Different sorting
pagedata.sort(columns=["Title","Datetime"],inplace=True)
pagedata.index=range(0,len(pagedata["URL"]))

headerString='''
<!DOCTYPE doctype html>

<html lang="en">
<head><title>Archive (alphabetical order)</title>
<meta charset="utf-8">

<meta content="" name="description"/>
<link href="../CLstyle.css" rel="stylesheet" type="text/css">
<link href="http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800" rel="stylesheet" type="text/css">
</link></link></meta></head>
<body><header><h1>Archive</h1></header>
<article>

<p>Articles sorted by date <a href="index.html">here</a>.  Alternatively <a href="http://cnr.lwlss.net">go home</a>.</p>

<ul>
'''

listString=''''''

for i in xrange(0,len(pagedata.URL)):
    line='<li><a href="'+pagedata.URL[i]+'">'+pagedata.Title[i]+' </a>'+pagedata.Time[i]+'\n'
    listString+=line

archiveFile=open("Archive/byname.html","w")
archiveFile.write(headerString+listString+tailString)
archiveFile.close()
