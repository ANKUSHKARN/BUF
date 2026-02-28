

POST - api/auth/login

GET - api/admin/brothers

POST - api/admin/brothers

GET - api/brother/me/profile

POST - api/brother/contribution
{
  "screenshotUrl": "https://example.com/payment-proof.jpg"
}
message: {"message":"Contribution submitted successfully","monthsCreated":13,"waiverUsedCount":5}

POST - api/admin/brother
{
  "name": "Ashutosh",
  "email": "ashu@buf.com",
  "password": "123456",
  "mobile": "2839232",
  "employmentStatus": "EMPLOYED/UNEMPLOYED"
  "monthlyContribution": 600
}
response: 
{"id":"69a0a3f73c2d0943865594ad","name":"Ashutosh","email":"ashu@buf.com","mobile":"2839232","role":"BROTHER","monthlyContribution":600,"waiverRemaining":1,"isActive":true,"joinDate":"2026-02-26T19:50:15.181Z","createdAt":"2026-02-26T19:50:15.181Z","updatedAt":"2026-02-26T19:50:15.181Z"}


/api/brother/contribution/history
/api/brother/contribution/history?userId
