var express = require('express');
var router = express.Router();

const SparqlClient = require('sparql-client-2')
const SPARQL = SparqlClient.SPARQL
const endpoint = 'https://rdf.ontotext.com/4139496814/Cryptonav/repositories/oacc'
const myupdateEndpoint = 'https://rdf.ontotext.com/4139496814/Cryptonav/repositories/oacc/statements'

var client = new SparqlClient( endpoint, {updateEndpoint: myupdateEndpoint, defaultParameters: {format: 'json'}})

client.register({rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', oacc: 'http://www.semanticweb.org/octavio/ontologies/2018/5/oacc#'})

/* GET home page. */
router.get('/', function(req, res, next) {
    var query = "select ?coin where{\n" +
                    "?s a oacc:Cryptocurrency.\n" +
                    "?s oacc:tag ?coin.\n"+
                "}"

    client.query(query)
            .execute()
            .then(function(qres){
                //console.log(JSON.stringify(qres))
                var resList = qres.results.bindings
                //console.log(resList)
                var dot = "digraph Cryptocurrencies {\n" +
                          'graph [layout=circo,bgcolor=transparent]'+
                          'Cryptocurrency [shape = circle,style = filled,color = red,fontname = Helvetica]'+
                          'rankdir=LR;'

                for(var i in resList){
                    var coin_name = resList[i].coin.value
                    var did = coin_name.slice(coin_name.indexOf('#')+1)
                    var url = "/nav/coin/" + did

                    dot += 'd' + i + '[fontname = Helvetica,shape = doublecircle,style = filled,color = orange,label="' + did + '",href="' + url + '"];\n'
                    dot += 'Cryptocurrency -> d' + i + ' [arrowhead=vee,color=white];\n'
                }
                    dot += "}"      
                res.render("showMap", {renderingCode: 'd3.select("#graph").graphviz().renderDot(\`' + dot + '\`)'})
            })
            .catch((error)=>{
                res.render("error", {error:error})
            })
})

router.get('/coin/:did', (req, res, next)=>{
    var did = req.params.did
    //console.log(did)
    var query = "select * where {\n" +
                    "?s a oacc:Cryptocurrency.\n" +
                    "?s oacc:tag ?name.\n" +
                    "OPTIONAL{?s oacc:usingAlgorithm ?a.\n"+
                    "?a oacc:name ?algorithm.}\n"+
                    "?s oacc:hasCreator ?c.\n"+
                    "?c oacc:name ?creator.\n"+
                    "?s oacc:name ?completename.\n" +
                    "OPTIONAL{?s oacc:isPOS ?pos.}\n"+
                    "OPTIONAL{?s oacc:isPOW ?pow.}\n"+
                    "OPTIONAL{?s oacc:about ?about.}\n"+
                    "OPTIONAL{?s oacc:blockreward ?breward.}\n"+
                    "OPTIONAL{?s oacc:blocktime ?btime.}\n"+
                    "OPTIONAL{?s oacc:circulatingsupply ?csupply.}\n"+
                    "OPTIONAL{?s oacc:founded ?founded.}\n"+
                    "OPTIONAL{?s oacc:icoammount ?icoammount.}\n"+
                    "OPTIONAL{?s oacc:maxsupply ?maxsupply.}\n"+
                    "OPTIONAL{?s oacc:networkdif ?netdif.}\n"+
                    "OPTIONAL{?s oacc:networkhashrate ?nethash.}\n"+
                    "OPTIONAL{?s oacc:premineammount ?preamount.}\n"+
                    "OPTIONAL{?s oacc:price ?price.}\n"+
                    "OPTIONAL{?s oacc:projectwhitepaper ?whitepaper.}\n"+
                    "OPTIONAL{?s oacc:symbol ?symbol.}\n"+
                    "OPTIONAL{?s oacc:tag ?tag.}\n"+
                    "OPTIONAL{?s oacc:website ?website.}\n"+
                    
                    'FILTER(str(?name) = '+'"'+did+'"'+')\n'+
                "}"

    client.query(query)
        .execute()
        .then(function(qres){
            var resList = qres.results.bindings
            var name = resList[0].name.value
            var completename = resList[0].completename.value
            var creator='',type='',about='',algorithm='',breward='',btime='',csupply='',founded='',icoammount='',maxsupply='',netdif='',nethash='',preamount='',price='',whitepaper='',symbol=''

            var dot = "digraph Coin {\n" +
                        'graph [layout=circo,bgcolor=transparent]'+
                        'rankdir=TB;\n' +
                        'CC [style=filled,color="dodgerblue",shape=doublecircle,label="Cryptocurrency",href="/nav"];\n' +
                        'CC -> name [arrowhead=vee,color=white];\n' +
                        'name [shape = circle,style = filled,color = red,fontname = Helvetica,label=' + completename + '];\n'
            if(resList[0].pos != undefined){
                type = "Proof-of-stake"
                dot+= 
                    'name -> pos [arrowhead=vee,color=white];\n' +
                    'pos [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Protection Scheme"];\n' +
                    'pos -> c1 [arrowhead=vee,color=white];\n'+
                    'c1 [shape = doublecircle,style = filled,color = green,fontname = Helvetica,label="POS",href="/posvspow"]'
            }
            if(resList[0].pow != undefined){
                type = "Proof-of-work"
                dot+= 
                    'name -> pow [arrowhead=vee,color=white];\n' +
                    'pow [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Protection Scheme"];\n' +
                    'pow -> c1 [arrowhead=vee,color=white];\n'+
                    'c1 [shape = doublecircle,style = filled,color = green,fontname = Helvetica,label="POW",href="/posvspow"]'
            }
            if(resList[0].algorithm != undefined && resList[0].algorithm != ''){
                algorithm = resList[0].algorithm.value
                dot+= 
                    'name -> algorithm [arrowhead=vee,color=white];\n' +
                    'algorithm [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Algorithm"];\n' +
                    'algorithm -> c14 [arrowhead=vee,color=white];\n'+
                    'c14 [shape = doublecircle,style = filled,color = green,fontname = Helvetica,label=\"'+ algorithm + '\",href="/nav/alg/' + did +'\"];\n'
            }
            if(resList[0].creator != undefined){
                creator = resList[0].creator.value
                dot+= 
                    'name -> creator [arrowhead=vee,color=white];\n' +
                    'creator [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Creator"];\n' +
                    'creator -> c2 [arrowhead=vee,color=white];\n'+
                    'c2 [shape = doublecircle,style = filled,color = green,fontname = Helvetica,label=\"'+ creator + '\",href="/nav/creator/' + did +'\"];\n'
            }   
            if(resList[0].founded != undefined){
                founded = resList[0].founded.value
                dot+= 
                    'name -> founded [arrowhead=vee,color=white];\n' +
                    'founded [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Foundation date"];\n' +
                    'founded -> c3 [arrowhead=vee,color=white];\n'+
                    'c3 [shape = circle,style = filled,color = green,fontname = Helvetica,label=\"'+ founded + '\"];\n'
            }
            if(resList[0].about != undefined){
                about = resList[0].about.value
                /*dot+= 
                    'name -> about;\n' +
                    'about [style=filled,color=".7 .3 1.0",shape=box,label="About"];\n' +
                    'about -> \"'+ about + '\";\n'
                */
            }
            if(resList[0].breward != undefined){
                breward = resList[0].breward.value
                dot+= 
                    'name -> breward [arrowhead=vee,color=white];\n' +
                    'breward [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Block Reward"];\n' +
                    'breward -> c4 [arrowhead=vee,color=white];\n'+
                    'c4 [shape = circle,style = filled,color = green,fontname = Helvetica,label=\"'+ breward + '\"];\n'
            }
            if(resList[0].btime != undefined){
                btime = resList[0].btime.value
                dot+= 
                    'name -> btime [arrowhead=vee,color=white];\n' +
                    'btime [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Block Time"];\n' +
                    'btime -> c5 [arrowhead=vee,color=white];\n'+
                    'c5 [shape = circle,style = filled,color = green,fontname = Helvetica,label=\"'+ btime + '\"];\n'
            }
            if(resList[0].csupply != undefined){
                csupply = resList[0].csupply.value
                dot+= 
                    'name -> csupply [arrowhead=vee,color=white];\n' +
                    'csupply [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Current supply"];\n' +
                    'csupply -> c6 [arrowhead=vee,color=white];\n'+
                    'c6 [shape = circle,style = filled,color = green,fontname = Helvetica,label=\"'+ csupply + '\"];\n'
            }
            if(resList[0].maxsupply != undefined){
                maxsupply = resList[0].maxsupply.value
                dot+= 
                    'name -> maxsupply [arrowhead=vee,color=white];\n' +
                    'maxsupply [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Maximum supply"];\n' +
                    'maxsupply -> c7 [arrowhead=vee,color=white];\n'+
                    'c7 [shape = circle,style = filled,color = green,fontname = Helvetica,label= \"'+ maxsupply + '\"];\n'
            }
            if(resList[0].icoammount != undefined){
                icoammount = resList[0].icoammount.value
                dot+= 
                    'name -> icoammount [arrowhead=vee,color=white];\n' +
                    'icoammount [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Coin sold in ICO"];\n' +
                    'icoammount -> c8 [arrowhead=vee,color=white];\n'+
                    'c8 [shape = circle,style = filled,color = green,fontname = Helvetica,label=\"'+ icoammount + '\"];\n'
            }
            if(resList[0].preamount != undefined){
                preamount = resList[0].preamount.value
                dot+= 
                    'name -> preamount [arrowhead=vee,color=white];\n' +
                    'preamount [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Premined coins"];\n' +
                    'preamount -> c9 [arrowhead=vee,color=white];\n'+
                    'c9 [shape = circle,style = filled,color = green,fontname = Helvetica,label=\"'+ preamount + '\"];\n'
            }
            if(resList[0].netdif != undefined){
                netdif = resList[0].netdif.value
                dot+= 
                    'name -> netdif [arrowhead=vee,color=white];\n' +
                    'netdif [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Network difficulty"];\n' +
                    'netdif -> c10 [arrowhead=vee,color=white];\n'+
                    'c10 [shape = circle,style = filled,color = green,fontname = Helvetica,label=\"'+ netdif + '\"];\n'
            }
            if(resList[0].nethash != undefined){
                nethash = resList[0].nethash.value
                dot+= 
                    'name -> nethash [arrowhead=vee,color=white];\n' +
                    'nethash [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Network hashrate"];\n' +
                    'nethash -> c11 [arrowhead=vee,color=white];\n'+
                    'c11 [shape = circle,style = filled,color = green,fontname = Helvetica,label=\"'+ nethash + '\"];\n'
            }
            if(resList[0].price != undefined){
                price = resList[0].price.value
                dot+= 
                    'name -> price [arrowhead=vee,color=white];\n' +
                    'price [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Price"];\n' +
                    'price -> c12 [arrowhead=vee,color=white];\n'+
                    'c12 [shape = circle,style = filled,color = green,fontname = Helvetica,label=\"'+ price + '\"];\n'
            }
            if(resList[0].whitepaper != undefined){
                whitepaper = resList[0].whitepaper.value
                /*dot+= 
                    'name -> whitepaper;\n' +
                    'whitepaper [style=filled,color=".7 .3 1.0",shape=box,label="Whitepaper"];\n' +
                    'whitepaper -> \"'+ whitepaper + '\";\n'
                */
            }
            if(resList[0].symbol != undefined){
                symbol = resList[0].symbol.value
                /*dot+= 
                    'name -> symbol;\n' +
                    'symbol [style=filled,color=".7 .3 1.0",shape=box,label="Logo"];\n' +
                    'symbol -> \"'+ symbol + '\";\n'
                */
            }
            if(resList[0].tag != undefined){
                tag = resList[0].tag.value
                dot+= 
                    'name -> tag [arrowhead=vee,color=white];\n' +
                    'tag [fontname = Helvetica,shape = circle,style = filled,color = orange,label="Tag"];\n' +
                    'tag -> c13 [arrowhead=vee,color=white];\n'+
                    'c13 [shape = circle,style = filled,color = green,fontname = Helvetica,label=\"'+ tag + '\"];\n'
            }
            if(resList[0].website != undefined){
                website = resList[0].website.value
                /*dot+= 
                    'name -> website;\n' +
                    'website [style=filled,color=".7 .3 1.0",shape=box,label="Website"];\n' +
                    'website -> \"'+ website + '\";\n'
                    */
            }
            
            dot += "}"
            
            res.render("showCoin", {
                renderingCode: 'd3.select("#graph").graphviz().renderDot(\`' + dot + '\`)',
                coinname: completename,
                creator:creator,
                alg:algorithm,
                url:website,
                logo:symbol,
                type:type,
                about:about,
                breward:breward,
                btime:btime,
                csupply:csupply,
                founded:founded,
                icoammount:icoammount,
                maxsupply:maxsupply,
                netdif:netdif,
                nethash:nethash,
                preamount:preamount,
                price:price,
                whitepaper:whitepaper,
                symbol:symbol
                })
            })
            .catch((error)=>{
                res.render("error", {error:error})
            })    
})

router.get('/creator/:did', function(req, res, next) {
    var did = req.params.did
    //console.log(did)
    var query = "select ?tag ?creator ?about ?photo where {\n" +
                    "?s a oacc:Cryptocurrency.\n" +
                    "?s oacc:tag ?tag.\n" +
                    "?s oacc:hasCreator ?c.\n"+
                    "?c oacc:name ?creator.\n"+
                    "OPTIONAL{?c oacc:symbol ?photo.}\n" +
                    "OPTIONAL{?c oacc:about ?about.}\n" +
                    
                    'FILTER(str(?tag) = '+'"'+did+'"'+')\n'+
                "}"

    client.query(query)
            .execute()
            .then(function(qres){
                var resList = qres.results.bindings
                var name = ''
                var about = ''
                var photo = ''
                if(resList[0].creator!=undefined)
                    name = resList[0].creator.value
                if(resList[0].about!=undefined)
                    about = resList[0].about.value
                if(resList[0].photo!=undefined)
                    photo = resList[0].photo.value

                res.render("creator", {creator:name,about:about,photo:photo})
            })
            .catch((error)=>{
                res.render("error", {error:error})
            })
})

router.get('/alg/:did', function(req, res, next) {
    var did = req.params.did
    //console.log(did)
    var query = "select ?algorithm ?about where {\n" +
                    "?s a oacc:Cryptocurrency.\n" +
                    "?s oacc:tag ?tag.\n" +
                    "?s oacc:usingAlgorithm ?c.\n"+
                    "?c oacc:name ?algorithm.\n"+
                    "?c oacc:about ?about.\n" +
                    
                    'FILTER(str(?tag) = '+'"'+did+'"'+')\n'+
                "}"

    client.query(query)
            .execute()
            .then(function(qres){
                var resList = qres.results.bindings
                var algorithm = ''
                var about = ''
                if(resList[0].algorithm!=undefined)
                    name = resList[0].algorithm.value
                if(resList[0].about!=undefined)
                    about = resList[0].about.value
                if(resList[0].photo!=undefined)
                    photo = resList[0].photo.value

                res.render("algorithm", {algorithm:name,about:about})
            })
            .catch((error)=>{
                res.render("error", {error:error})
            })
})

module.exports = router;