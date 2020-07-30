var express = require('express');
var exphbs=require('express-handlebars');
var app = express();
var hbs=exphbs.create({});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.get('/', function (req, res){
    res.sendFile(__dirname + "/" + "index.htm");
})

app.get('/result', function (req, res){
    response = {
        meds:req.query.meds
    };  
    var stringOfMeds = response.meds;
    arrayOfStrings = stringOfMeds.split(',');
    function removeDups(names){
        let unique = {};
        names.forEach(function(i){
            if(!unique[i]){
                unique[i] = true;
            }
        });
        return Object.keys(unique);
    }
    arrayOfStrings = removeDups(arrayOfStrings);
    console.log(arrayOfStrings);
    const fs = require('fs');
    const csv = require('csv-parser');
    const LEN = 221;
    var jsonObject=[];
    var details;
    var nyears;
    var previous_title ='0';
    var numYears=[];
    var countYears = new Array(LEN).fill(0);
    fs.createReadStream('metadata.csv')
    .pipe(csv())
    .on('data', (row)=>{
        var medicines = '';
        var Bool = 0;
        const Title = row.title.toLowerCase();
        const Abstract = row.abstract.toLowerCase();
        for (i =0; i<arrayOfStrings.length; i++){
            if (Title.includes(arrayOfStrings[i].toLowerCase()) || Abstract.includes(arrayOfStrings[i].toLowerCase())){
                if(medicines==''){
                    medicines=arrayOfStrings[i];
                }
                else{
                    medicines = medicines +','+ arrayOfStrings[i];
                }
               
                Bool=1;
                var pubTime = row.publish_time;
                if (row.publish_time==''){
                    console.log('blank_publish_time');
                }
                else{
                if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(pubTime)){
                    times = pubTime.substr(pubTime.length - 4);
                }
                else if (/^\d{1,2}\-\d{1,2}\-\d{4}$/.test(pubTime)){
                    times = pubTime.substr(pubTime.length - 4);
                }
                else if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(pubTime)){
                    times = pubTime.substr(0,4);
                }
                else if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(pubTime)){
                    times = pubTime.substr(0,4);
                }
                else{
                    times = pubTime;
                }
                var x = Number(times) - 1800;
                if (x<0){
                    console.log(x);
                }
            }
            }
        }
        if(Bool==1){
        details = {
            article:row.cord_uid,
            journal:row.journal,
            medicines:medicines
        }
        countYears[x]=countYears[x]+1;
        jsonObject.push(details);
    }
         
    })
    .on('end', () => {  
        for(i=0; i<countYears.length-1; i++){
            if(countYears[i]!=0 ){
                nyears={year: i+1800, number: countYears[i]};
                numYears.push(nyears);
        }
    }
    res.render("meds", {meds: jsonObject, years: numYears});
    console.log("success reading file csv")
    })
})

var server = app.listen(8081, function (){
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})