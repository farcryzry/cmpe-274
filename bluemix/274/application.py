from flask import Flask
import pandas as pd
import sys
from pybrain.datasets import SequentialDataSet
from itertools import cycle
from pybrain.tools.shortcuts import buildNetwork
from pybrain.structure.modules import LSTMLayer
from random import randint
from pybrain.supervised import RPropMinusTrainer


# print a nice greeting.
def say_hello(username = "World"):
    return '<p>Hello %s!</p>\n' % username

def say_hello_text(username = "World",text="You are good"):

    object_data_new = pd.read_csv('/Users/ruiyun_zhou/Documents/cmpe-274/data/data.csv')
    data_area_new = object_data_new[object_data_new.Area==username]
    data_area_new_1=data_area_new[data_area_new.Disease== text]
    data_list_new = data_area_new_1['Count'].values.tolist()
    print data_list_new.__len__()
    data_list=data_list_new
    ds = SequentialDataSet(1,1)
    for sample,next_sample in zip(data_list,cycle(data_list[1:])):
        ds.addSample(sample, next_sample)

    net = buildNetwork(1,5,1,hiddenclass=LSTMLayer,outputbias=False,recurrent=True)
    trainer = RPropMinusTrainer(net, dataset=ds)
    train_errors = [] # save errors for plotting later
    EPOCHS_PER_CYCLE = 5
    CYCLES = 10
    EPOCHS = EPOCHS_PER_CYCLE * CYCLES
    for i in xrange(CYCLES):
        print "Doing epoch %d" %i
        trainer.trainEpochs(EPOCHS_PER_CYCLE)
        train_errors.append(trainer.testOnData())
        epoch = (i+1) * EPOCHS_PER_CYCLE
#    return '<p>%d</p>\n' % (data_list_new.__len__())
#        print("final error =", train_errors[-1])
#    print "Value for last week is %4.1d" % abs(data_list[-1])
#    print "Value for next week is %4.1d" % abs(net.activate(data_list[-1]))
    result = (abs(data_list[-1]))
    return '[%d, %d]' % (result,result)

header_json ='''{Count:'''
    
    

footer_json = '''}'''

# some bits of text for the page.
header_text = '''
    <html>\n<head> <title>EB Flask Test</title> </head>\n<body>'''
instructions = '''
    <p><em>Hint</em>: This is a RESTful web service! Append a username
    to the URL (for example: <code>/Thelonious</code>) to say hello to
    someone specific.</p>\n'''
home_link = '<p><a href="/">Back</a></p>\n'
footer_text = '</body>\n</html>'

# EB looks for an 'application' callable by default.
application = Flask(__name__)

# add a rule for the index page.
application.add_url_rule('/', 'index', (lambda: header_text +
                                        say_hello() + instructions + footer_text))

# add a rule when the page is accessed with a name appended to the site
# URL.
application.add_url_rule('/<username>', 'hello', (lambda username:
                                                  header_text + say_hello(username) + home_link + footer_text))

#application.add_url_rule('/<username>/<text>', 'second', (lambda username,text:
#                                                  header_text + say_hello_text(username,text) + home_link + footer_text))
application.add_url_rule('/<username>/<text>', 'second', (lambda username,text:
                                                          say_hello_text(username,text)))

# run the app.
if __name__ == "__main__":
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    application.debug = True
    application.run()




#object_data_new = pd.read_csv('/Users/huzefa/Desktop/data.csv')
##
## for line in open("/Users/admin/Desktop/red.csv"):
##     csv_row = line.split()
##     print csv_row[0]
##     if(csv_row[0]=='CALIFORNIA'):
##         print csv_row[8]
##print object.loc[1][1]
##data_area = object_data[object_data.Area=='ALABAMA']
##data_list = data_area['Salmonellosis'].values.tolist()
#
#
#
#data_area_new = object_data_new[object_data_new.Area=='ALABAMA']
#data_area_new_1=data_area_new[data_area_new.Disease== 'Syphilis, primary and secondary']
#data_list_new = data_area_new_1['Count'].values.tolist()
#print data_list_new.__len__()
#
#data_list = data_list_new
#
#print data_list[-1]
#print data_list
##list_week = object['Week'].values.tolist()
##print list_week
##print object[1][1]
## df.index = df.index.map(int)
## for col in df.columns:
##     column = df[col]
##     column.to_csv(column.name, sep='=')
##
## print column
##df=pd.read_csv('/Users/admin/Desktop/reduced.xls')
##print df.columns[1:]
##print df.head()
##print df.describe()
##print df.std()
#
##print df['ALABAMA'][6]
#
##print df[1][2]
#
##print df.head()
#
##print df.nrows
## column_generator = (worksheet.row_values(i)[0] for i in range(worksheet.nrows))
#
#data = [1] *3 + [2] *3
#data*=3
## print (data)
#
#from pybrain.datasets import SequentialDataSet
#from itertools import cycle
#
#ds = SequentialDataSet(1,1)
#for sample,next_sample in zip(data_list,cycle(data_list[1:])):
#    #print sample + "  " + next_sample
#    ds.addSample(sample, next_sample)
#
#
#
#from pybrain.tools.shortcuts import buildNetwork
#from pybrain.structure.modules import LSTMLayer
#
#net = buildNetwork(1,5,1,hiddenclass=LSTMLayer,outputbias=False,recurrent=True)
#
#from pybrain.supervised import RPropMinusTrainer
#
#trainer = RPropMinusTrainer(net, dataset=ds)
#train_errors = [] # save errors for plotting later
#EPOCHS_PER_CYCLE = 5
#CYCLES = 100
#EPOCHS = EPOCHS_PER_CYCLE * CYCLES
#for i in xrange(CYCLES):
#    print "Doing epoch %d" %i
#    trainer.trainEpochs(EPOCHS_PER_CYCLE)
#    train_errors.append(trainer.testOnData())
#    epoch = (i+1) * EPOCHS_PER_CYCLE
#print("final error =", train_errors[-1])
#
##for sample, target in ds.getSequenceIterator(0):
##     print("               sample = %4.1f" % sample)
##     print("predicted next sample = %4.1f" % net.activate(sample))
##     print("   actual next sample = %4.1f" % target)
#
#
##sample,target = ds.getSequenceIterator(ds.getSequenceLength(0))
#print "Value for last week is %4.1d" % abs(data_list[-1])
#print "Value for next week is %4.1d" % abs(net.activate(data_list[-1]))
## print "Actaully it is " + target
##print ds.