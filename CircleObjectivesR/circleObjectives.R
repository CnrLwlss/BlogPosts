###########
# Optimum circle packing in R
# http://cnr.lwlss.net/CircleObjectivesR/
###########

# Function closure, sets up list of possible combinations
# and returns objective function for packing N circles 
# into a rectangle of of width W and height H.
# "Soft" edge constraints
createObj<-function(N,W,H){
	print("Generating combinations...")
	# Generate all possible circle pairings
	cpairs=data.frame(t(combn(1:N,2)))
	colnames(cpairs)=c("A","B")
	print("Combinations complete.")
	return({
		newObj<-function(z){
			# This vector is split up into triplets of x,y,r 
			# z[1],z[2],z[3] -> x1,y1,r1
			x=z[1:N*3-2]
			y=z[1:N*3-1]
			r=z[1:N*3-0]
			res=0

			# Some linear inequality constraints to be satisfied
			c1=x+r-W # <0	
			c2=y+r-H # <0
			c3=r-x # <= 0
			c4=r-y # <=0

			# Many nonlinear inequality constraints
			c5=r[cpairs$A]+r[cpairs$B]-sqrt((x[cpairs$A]-x[cpairs$B])^2+(y[cpairs$A]-y[cpairs$B])^2) # <=0
			
			c1=c1[c1>0]
			c2=c2[c2>0]
			c3=c3[c3>0]
			c4=c4[c4>0]
			c5=c5[c5>0]

			constraints=c(c1,c2,c3,c4,c5)

			if(length(constraints)>0){
				constraints=constraints^2
				res=res-sum(constraints)
			}
			
			# Actual objective function (fraction of area covered)
			res=res+(pi*sum(r^2))/(W*H)	

			return(-1*res)
		}
	})
}

# Function closure, sets up list of possible combinations
# and returns objective function for packing N circles 
# into a rectangle of of width W and height H.
# Edge constraints must be completely satisfied
createHardObj<-function(N,W,H){

	print("Generating combinations...")

	# Generate all possible circle pairings
	cpairs=data.frame(t(combn(1:N,2)))
	colnames(cpairs)=c("A","B")
	print("Combinations complete.")

	return({

		newHardObj<-function(z){

			# This vector is split up into triplets of x,y,r 
			# z[1],z[2],z[3] -> x1,y1,r1
			x=z[1:N*3-2]
			y=z[1:N*3-1]
			r=z[1:N*3-0]

			res=0
			# Some nonlinear inequality constraints to be satisfied
			if(FALSE%in%(x+r<W)) res = Inf
			if(FALSE%in%(y+r<H)) res = Inf
			if(FALSE%in%(x-r>=0)) res = Inf
			if(FALSE%in%(y-r>=0)) res = Inf
			
			# Many nonlinear inequality constraints
			if(FALSE%in%(((x[cpairs$A]-x[cpairs$B])^2+(y[cpairs$A]-y[cpairs$B])^2)>=(r[cpairs$A]+r[cpairs$B])^2)) res = Inf

			# Actual objective function (fraction of area covered)
			res=res+(pi*sum(r^2))/(W*H)
			return(-1*res)
		}
		})
}

# Draw circles (centres and radii speficied in df)
# within a bounding rectangle (width * height)

drawCircles<-function(df,width,height,colour="black",pdfName=NULL){
	if(is.null(pdfName)){
		graphics.off()
		dev.new(width=7, height=7*height/width)
	}else{
		pdf(pdfName,width=7,height=7*height/width)
	}
	
	maxdim=max(width,height)
	width=width/maxdim
	height=height/maxdim
	df=df/maxdim

	# Change to coordinate system based on centre of rectangle
	df$x=df$x-width/2
	df$y=df$y-height/2

	# Draws circles on a square
	par(plt=c(0,1,0,1))
	plot(NULL,xlim=c(-width/2,width/2),ylim=c(-height/2,height/2),axes=FALSE,xaxt='n',yaxt='n',ann=FALSE)
	symbols(df$x,df$y,circles=df$r,fg=colour,bg=NA,add=TRUE,inches=FALSE) 
	rect(-width/2,-height/2,width/2,height/2)
	if(!is.null(pdfName)) dev.off()
}

# Draw a square packed with 13 circles

# Number of circles and dimensions of bounding rectangle 
N=13; W=10; H=10

# Create objective function
obj=createObj(N,W,H)

# Lowest acceptable values for dimensions or radii (x,y,r) is zero
low=rep(0,3*N)

# x can go as high as W, y as high as H
# The biggest allowable circle radius is the smaller of W and H
up=rep(c(W,H,min(W,H)),N)

# Initial guess (random circle coordinates and radii)
z=rep(0,3*N)
z[1:N*3-2]=runif(N,0,W)
z[1:N*3-1]=runif(N,0,H)
z[1:N*3-0]=runif(N,0,0.1*min(W,H))

out=optim(par=z,fn=obj,method="L-BFGS-B",lower=low,upper=up,control=list(maxit=2000))

cat("Fractional area:",-1*out$value)
z=as.numeric(out$par)
x=z[1:N*3-2]; y=z[1:N*3-1]; r=abs(z[1:N*3-0])
dfA=data.frame(x=x,y=y,r=r)
drawCircles(dfA,W,H)