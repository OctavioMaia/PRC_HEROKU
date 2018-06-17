var express = require('express');
var router = express.Router();

const SparqlClient = require('sparql-client-2')
const SPARQL = SparqlClient.SPARQL
const endpoint = 'https://rdf.ontotext.com/4139496814/cryptonav/repositories/oacc'
const myupdateEndpoint = 'https://rdf.ontotext.com/4139496814/cryptonav/repositories/oacc/statements'

var client = new SparqlClient( endpoint, {updateEndpoint: myupdateEndpoint, defaultParameters: {format: 'json'}})

client.register({rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', oacc: 'http://www.semanticweb.org/octavio/ontologies/2018/5/oacc#'})

/* GET home page. */
router.get('/', function(req, res, next) {
    var query = "select ?tag ?ico ?premine ?fair ?fork where{\n" +
                    "?s a oacc:Cryptocurrency.\n" +
                    "?s oacc:tag ?tag.\n"+
                    "OPTIONAL{?s oacc:hasICO ?ico.}\n"+
                    "OPTIONAL{?s oacc:hasPremine ?premine.}\n"+
                    "OPTIONAL{?s oacc:hasNone ?fair.}\n"+
                    "OPTIONAL{?s oacc:forkedFrom ?fork.}\n"+
                "}"

    client.query(query)
            .execute()
            .then(function(qres){
                //console.log(JSON.stringify(qres))
                var resList = qres.results.bindings
                //console.log(resList)
                var dot = "digraph Cryptocurrencies {\n" +
                          'graph [layout=circo,bgcolor=transparent]'+
                          'Fair [shape = circle,style = filled,color = steelblue,fontname = Helvetica]'+
                          'ICO [shape = circle,style = filled,color = steelblue,fontname = Helvetica]'+
                          'Premine [shape = circle,style = filled,color = steelblue,fontname = Helvetica]'+
                          'Fork [shape = circle,style = filled,color = steelblue,fontname = Helvetica]'+
                          'rankdir=LR;'

                for(var i in resList){
                    var coin_name = resList[i].tag.value
                    if(resList[i].ico!=undefined){
                        var did = coin_name.slice(coin_name.indexOf('#')+1)
                        var url = "/nav/coin/" + did

                        dot += 'd' + i + '[fontname = Helvetica,shape = doublecircle,style = filled,color = paleturquoise,label="' + did + '",href="' + url + '"];\n'
                        dot += 'ICO -> d' + i + ' [penwidth=3,arrowhead=vee,color=white];\n'
                    }else if(resList[i].premine!=undefined){
                        var did = coin_name.slice(coin_name.indexOf('#')+1)
                        var url = "/nav/coin/" + did

                        dot += 'd' + i + '[fontname = Helvetica,shape = doublecircle,style = filled,color = paleturquoise,label="' + did + '",href="' + url + '"];\n'
                        dot += 'Premine -> d' + i + ' [penwidth=3,arrowhead=vee,color=white];\n'
                    }else if(resList[i].fork!=undefined){
                        var did = coin_name.slice(coin_name.indexOf('#')+1)
                        var url = "/nav/coin/" + did

                        dot += 'd' + i + '[fontname = Helvetica,shape = doublecircle,style = filled,color = paleturquoise,label="' + did + '",href="' + url + '"];\n'
                        dot += 'Fork -> d' + i + ' [penwidth=3,arrowhead=vee,color=white];\n'
                    }else{
                        var did = coin_name.slice(coin_name.indexOf('#')+1)
                        var url = "/nav/coin/" + did

                        dot += 'd' + i + '[fontname = Helvetica,shape = doublecircle,style = filled,color = paleturquoise,label="' + did + '",href="' + url + '"];\n'
                        dot += 'Fair -> d' + i + ' [penwidth=3,arrowhead=vee,color=white];\n'
                    }
                }
                dot += "}"
                res.render("distribution", {renderingCode: 'd3.select("#graph").graphviz().renderDot(\`' + dot + '\`)'})
            })
            .catch((error)=>{
                res.render("error", {error:error})
            })
})

module.exports = router;