const PROTO_PATH = "../customers.proto";

const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const {v4: uuidv4} = require("uuid"); 

const packageDefinition = protoLoader.loadSync(PROTO_PATH,{
   keepCase: true,
   longs: String,
   enums: String,
   arrays: true
}) 

// Convert Proto file to package defination
var customersProto= grpc.loadPackageDefinition(packageDefinition)

/**
 * Create the server 
 */
const server = new grpc.Server();  

// Dummy inital Data
const customers = [
   {
      id: "a68b823c-7ca6-44bc-b721-fb4d5312cafc",
      name:"John Bolton",
      age: 23,
      address:"Address 1"
   },
   {
      id:"34415c7c-f82d-4e44-88ca-ae2a1aaa92b7",
      name:"Mary Anne",
      age:45,
      address:"Address 2"
   }
];

// Tells the server that which services the server needs to perform.

server.addService(customersProto.CustomerService.service,{
   getAll:(call,callback) => {
      if (!call.cancelled){
         callback(null,{customers});
      }
   },
   get:(call,callback) => {
      let customer = customers.find(n => n.id == call.request.id);
      if (customer){
         callback(null,customer);
      }else{
         callback({
            code:grpc.status.NOT_FOUND,
            details:"Not found"
         });
      }
   },
   insert: (call,callback) => {
      let customer = call.request;

      customer.id = uuidv4();
      customers.push(customer);
      callback(null,customer);
   },
   update: (call,callback) => {
      let existingCustomer = customers.find(n => n.id == call.request.id);
      if (existingCustomer){
         existingCustomer.name = call.request.name;
         existingCustomer.age = call.request.age;
         existingCustomer.address = call.request.address;
         callback(null,existingCustomer);
      }else{
         callback({
            code: grpc.status.NOT_FOUND,
            details:"Not found"
         })
      }
   },
   remove:(call,callback) => {
      let existingCustomerIndex = customers.findIndex(n => n.id == call.request.id);
      if (existingCustomerIndex != -1){
         customers.splice(existingCustomerIndex,1);
         callback(null,{});
      }else{
         callback({
            code: grpc.status.NOT_FOUND,
            details:"Not found"
         })
      }
   }
})

server.addService()

// Deploy the server to host and port without authentication( Not Recommend for production.)
server.bind("127.0.0.1:30043",grpc.ServerCredentials.createInsecure());
server.start();