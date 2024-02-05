from flask import Flask
from modules.league.routes import league_bp
from modules.user.routes import my_pick_bp

app = Flask(__name__)
app.register_blueprint(league_bp, url_prefix='/league')
app.register_blueprint(my_pick_bp, url_prefix='/pick')
# TODO: create a rate limiter for each user to prevent DDOS attacks, overuse, etc.

@app.route('/')
def hello():
    return '<p>Hello, World!</p>'



@app.route('/picks')
def method_name():
    print("sup")
    return "sup"



if __name__ == '__main__':
    app.run()