var express = require('express');
var router = express.Router();

const SparqlClient = require('sparql-client-2')
const SPARQL = SparqlClient.SPARQL
const endpoint = 'https://rdf.ontotext.com/4139496814/cryptonav'
const myupdateEndpoint = 'https://rdf.ontotext.com/4139496814/cryptonav/statements'

var client = new SparqlClient( endpoint, {updateEndpoint: myupdateEndpoint, defaultParameters: {format: 'json'}})

client.register({rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', oacc: 'http://www.semanticweb.org/octavio/ontologies/2018/5/oacc#'})

/* GET home page. */
router.get('/', function(req, res, next) {
    var query = "select ?tag ?alg_name where{\n" +
                    "?s a oacc:Cryptocurrency.\n" +
                    "?s oacc:tag ?tag.\n"+
                    "OPTIONAL{?s oacc:usingAlgorithm ?alg.\n"+
                             "?alg oacc:name ?alg_name.}\n"+
                "}"

    client.query(query)
            .execute()
            .then(function(qres){
                //console.log(JSON.stringify(qres))
                var resList = qres.results.bindings
                var dot = "digraph Cryptocurrencies {\n" +
                          'graph [layout=circo,bgcolor=transparent]'+
                          'rankdir=LR;'

                for(var i in resList){
                    var coin_name = resList[i].tag.value
                    if(resList[i].alg_name!=undefined){
                        if(resList[i].alg_name.value=='Blake (14r)')
                            var alg_name = 'Blake14R'
                        else
                            var alg_name = resList[i].alg_name.value.replace(/-/g,'')
                    }else{
                        var alg_name = 'None'
                    }
                    
                    dot+=alg_name+' [shape = circle,style = filled,color = steelblue,fontname = Helvetica]'
                    var did = coin_name.slice(coin_name.indexOf('#')+1)
                    var url = "/nav/coin/" + did

                    dot += 'd' + i + '[fontname = Helvetica,shape = doublecircle,style = filled,color = paleturquoise,label="' + did + '",href="' + url + '"];\n'
                    dot += alg_name + ' -> d' + i + ' [arrowhead=vee,color=white];\n'
                }
                dot += "}"
                res.render("alg", {renderingCode: 'd3.select("#graph").graphviz().renderDot(\`' + dot + '\`)'})
            })
            .catch((error)=>{
                res.render("error", {error:error})
            })
})

module.exports = router;