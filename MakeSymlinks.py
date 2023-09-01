import os
oldblog = "./"
newblog = os.path.join("..","cnrlwlss","public")
oldblogposts = [x[0] for x in os.walk(oldblog)]
oldblogposts = [postdir for postdir in oldblogposts if postdir!= oldblog]
oldblogposts = [postdir for postdir in oldblogposts if ".git" not in postdir]

for postdir in oldblogposts:
    src = os.path.abspath(postdir)
    dst = os.path.abspath(os.path.join(newblog,os.path.basename(postdir)))
    print(src+" -> "+dst)
    os.symlink(src,dst)



