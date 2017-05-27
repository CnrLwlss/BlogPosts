import os, sys

newstr = '''</head>

<div id = "banner">
<a href="http://cnr.lwlss.net">
<div style="display:inline-block; align: center;vertical-align: middle;" >
  <img src="../logo.png" style="height:150px; padding-right: 20px;">
</div>
<div style="display:inline-block;vertical-align: middle;">
  <h1 style="margin-top:-10; margin-bottom:-10;">Conor Lawless</h1>
  <h2 style="margin-top:-10; margin-bottom:-10;">Scientific Computing</h2>
  <h3 style="margin-top:-10; margin-bottom:-10;">http://cnr.lwlss.net</h3>
</div>
</a>
</div>

'''

# Let's find what directory we're in
syspath = os.path.dirname(sys.argv[0])
fullpath = os.path.abspath(syspath)

# Get all the subdirectories in the current directory
dirlist=[]
allfiles=os.listdir(fullpath)
for filename in allfiles:
    if "." not in filename and filename not in ["Archive","jsLibs","AboutConor"]:
        dirlist.append(filename)

for dirn in dirlist:
    ind = os.path.join(fullpath,dirn,"index.html")
    with open(ind, 'r') as file :
        filedata = file.read()

    # Replace the target string
    filedata = filedata.replace('</head>', newstr)

    # Write the file out again
    with open(ind, 'w') as file:
      file.write(filedata)
    
