#s is the skeleton app code
from bottle import route, run, template, static_file, url, default_app, request, get, post  # or route
import bottle
import os
import sys
import pymongo 
from pymongo import MongoClient
import newspaper
import nltk
MONGODB_URI = 'mongodb://prerna_d:prerna_d@ds241065.mlab.com:41065/truthchain'
client = MongoClient(MONGODB_URI, connectTimeoutMS=30000)
db = client.get_database("truthchain")
print(db)
#client=MongoClient('localhost',27017)
##connection = MongoClient("ds237815.mlab.com", 37815)
#mongodb://<dbuser>:<dbpassword>@ds237815.mlab.com:37815/truthchain
#db = connection["truthchain"]
#db.authenticate("narendranath","Naththota.1")
#db=connection['truthminer_db']
#print("Entered File")
def calculate_something(input_data):
    return "the answer"

path = os.path.abspath(__file__)
dir_path = os.path.dirname(path)

if(sys.platform == 'win32'):
    templates_dir = os.path.join(dir_path, 'views')
    if templates_dir not in bottle.TEMPLATE_PATH:
        bottle.TEMPLATE_PATH.insert(0, templates_dir)
    # the code above allows the same file layout to be used on the localhost and 
    # pythonanywhere site. In the app directory is app.py and two directories
    # static and views.  Static has the css/js/images, views contains index.html
    # on pythonanywhere the bottle.TEMPLATE_PATH is set in the app_wsgi.py file
    # located at /var/www

@route('/')
def home():
    ''' A bit of documentation
    '''
    return template('index.html')

@route('/<filename:path>')
def send_static(filename):
    ''' This makes the extant template start working
       Woo-Hoo!
    '''
    return static_file(filename, root=dir_path+'/'+'static/') 
    # the dir_path+'/'+ needed to be added to get this to serve static pages on PythonAnywhere
    # also I had to create a 'views' directory and put the index.html file into the views directory

@route('/truthchain')
def hello():
    ''' A bit of documentation
    '''
    return '<p>Please input your url here...</p><br/><form action="/login" method="post">Input URL:<input type="text" id="url" name="url"><button type="submit" id="submit">Submit</button></form>'
@post('/login') # or @route('/login', method='POST')
def post_url():
	url=request.forms.get('url')

	#[s + url for s in catlist]
	try:
		if client.get_database('finaldemo1'):
			print("Connection Successful")
			als = db.als
			#db.demo_db.insert_one
			paper=newspaper.build(url)
			#print(len(paper.articles))
			for article in paper.articles:
			   # article = paper.articles[i]
			    article.download()
			    article.parse()
			    article.nlp()
			    #if len(article.authors)!=0:
			    post = {"article": article.summary,"writer":article.authors,"source":url,"status":"submitted","comment":"NA"}
			    als.insert_one(post)
		            print(article.title)
					#person = {'name':'Barack Obama', 'role':'president'}
					#people.insert(person)
		return "Thank You"
	except Exception as e:
		print(e)
		return "Error"
	
@route('/hello/', method='GET')
def hello():
    ''' A bit of documentation
    '''
    return '<h1>Hello World (two slash...) !</h1>'

@route('/location', method = 'POST')
def location():
    return calculate_something(input_data)

#
# the lines below recommended by PythonAnywhere forum for Bottle webapp
#

application = default_app()
if __name__ == '__main__':
    bottle.debug(True)                              # remove this for production
    bottle.run(host='0.0.0.0', port=8080)

