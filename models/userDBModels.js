var dbconnection=require('./dbmanager');
var db=dbconnection.db;

exports.getUserDetails=()=>{
    const query='Select * from tbl_user';

    let stmt=db.prepare(query);
    let res=stmt.all();

    return res;
}