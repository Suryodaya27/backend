const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index'); 
const expect = chai.expect;

chai.use(chaiHttp);


describe('api requests', function(){

  it('get loans' , function(done){
    chai.request(app)
      .get('/loan/types')
      .end((err,res)=>{
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      })
  })

  it('get loan banks', function(done){
    chai.request(app)
      .get('/loan/types/2/banks')
      .end((err,res)=>{
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      })
  })

  it('should submit a loan application', function (done) {
    const typeId = '1';
    const bankId = '7';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJpYXQiOjE2ODcxNjQ1ODgsImV4cCI6MTY4NzE2ODE4OH0.QX8cK1jDEE_hvARNVaOzbYcTfLL_w6mt9fUmkSzuFsM';
    const applicationData = {
      amount: 5000,
      applicationName: "Surya",
      applicationGovId: "ABCD1234",
      duration: 12
    };
    chai
      .request(app)
      .post(`/loan/types/${typeId}/banks/${bankId}/application`)
      .set('Authorization', `Bearer ${token}`)
      .send(applicationData)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('application');
        done();
      });
  });


  it('web hook ', function (done) {
    const applicationData={
      applicationId : 5,
      status : "Disbursed",
      remark: "money will be credited in your account soon"
    }
    chai
      .request(app)
      .post("/finurl-webhook")
      .send(applicationData)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });

})
