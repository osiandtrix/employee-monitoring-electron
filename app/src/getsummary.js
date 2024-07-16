const {Navigator}=require('node-navigator');
const { desktopCapturer } = require('electron');
const { getAllHistory } = require('node-browser-history');

const navigator=new Navigator();

//Get the current IP Address
function getCurrentIPAddress(){
    const url = 'https://jsonip.com';
    const req = require('request'); 
    return new Promise((resolve, rej) => {
        req.get({
                url: url,
                agentOptions: {
                    rejectUnauthorized: false
                },
                json: true,
                headers: {'User-Agent': 'request'}
            }, (err, res, data) => {
                if (err) {
                rej(err);
                } else if (res.statusCode !== 200) {
                rej(res.statusCode);
                } else {
                    resolve(data.ip);
                }
            });
    })

   /* require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        if(err) console.log(err);
        else return callback(add);
    });*/
}

//Get Location lat lon
function getCoordinates(){
    return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition((success,err)=>{
            if(err){
                rej(err)
            }
            res({'lat':success.latitude,'lon':success.longitude});
        });
    });
}

//Get List of application user is using
async function getListofAppUses(){
    return new Promise((res, rej) => {
            var listOfAppDetails={};
            desktopCapturer.getSources({ types: ['window', 'screen'] })
            .then(sources => {
                for(let i=0;i<sources.length;i++) {
                 
                  let appItem=sources[i].name.split('-');
                  if(appItem.length>0){
                    if(appItem[appItem.length-1]!=='Entire Screen')
                    listOfAppDetails[appItem[appItem.length-1]]=sources[i].name;
                  }              
                }
                res(listOfAppDetails)
            }).catch(err => rej(err));  
    });
}

//Get the list of website user interacting
async function getListOfWebsiteByTime(last_between_duration){
    return new Promise((res, rej) => {
        getAllHistory(last_between_duration)
        .then((listOfHistories)=>{
            let history;
            for(let i=0;i<listOfHistories.length;i++){
                if(listOfHistories[i].length>0) {
                    history = listOfHistories[i];
                    break;
                }
            }
            if(history) {
                console.log('listOfHistories=====>',history)
                res(JSON.stringify(history));
            } else {
                rej('no data')
            }
        }).catch(err => rej(err));
    });
}

module.exports={
    getCurrentIPAddress,
    getCoordinates,
    getListofAppUses,
    getListOfWebsiteByTime
}