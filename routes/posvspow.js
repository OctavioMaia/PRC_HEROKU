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
    var query = "select ?tag ?pow ?pos where{\n" +
                    "?s a oacc:Cryptocurrency.\n" +
                    "?s oacc:tag ?tag.\n"+
                    "OPTIONAL{?s oacc:isPOW ?pow.}\n"+
                    "OPTIONAL{?s oacc:isPOS ?pos.}\n"+
                "}"

    client.query(query)
            .execute()
            .then(function(qres){
                //console.log(JSON.stringify(qres))
                var resList = qres.results.bindings
                //console.log(resList)
                var dot = "digraph Cryptocurrencies {\n" +
                          'graph [layout=circo,bgcolor=transparent]'+
                          'POW [shape = circle,style = filled,color = red,fontname = Helvetica]'+
                          'POS [shape = circle,style = filled,color = green,fontname = Helvetica]'+
                          'rankdir=LR;'

                for(var i in resList){
                    var coin_name = resList[i].tag.value
                    if(resList[i].pow!=undefined){
                        var did = coin_name.slice(coin_name.indexOf('#')+1)
                        var url = "http://cryptonav.herokuapp.com/nav/coin/" + did

                        dot += 'd' + i + '[fontname = Helvetica,shape = doublecircle,style = filled,color = orange,label="' + did + '",href="' + url + '"];\n'
                        dot += 'POW -> d' + i + ' [arrowhead=vee,color=white];\n'
                    }else{
                        var did = coin_name.slice(coin_name.indexOf('#')+1)
                        var url = "http://cryptonav.herokuapp.com/nav/coin/" + did

                        dot += 'd' + i + '[fontname = Helvetica,shape = doublecircle,style = filled,color = orange,label="' + did + '",href="' + url + '"];\n'
                        dot += 'POS -> d' + i + ' [arrowhead=vee,color=white];\n'
                    }
                }
                    dot += "}"      
                res.render("posvspow", {renderingCode: 'd3.select("#graph").graphviz().renderDot(\`' + dot + '\`)'})
            })
            .catch((error)=>{
                res.render("error", {error:error})
            })
})

module.exports = router;
