// import request from 'supertest'
// import app from '../app'

// import { QueryResult } from 'pg'
// import { query } from '../config/db'
// import { auth } from '../lib/auth'
// import { pod } from '../types'

// jest.mock('../config/db')
// jest.mock('../lib/auth')

// const testpod: pod = {
//   id: "test-pod-id",
//   name: "Bken Test pod",
// }

// const mockQuery = query as jest.MockedFunction<typeof query>
// const mockAuth = auth as jest.MockedFunction<typeof auth>

// describe("Pods Endpoint", () => {
//   beforeEach(() => {
//     jest.clearAllMocks()
//   })

//   it('should list pods', async () => {
//     const res = await request(app).get('/pods')
//     expect(res.statusCode).toEqual(200)
//   })

//   it('should create a pod', async () => {
//     const res = await request(app).post('/pods')
//     expect(res.statusCode).toEqual(200)
//   })

//   it('should get a pod', async () => {
//     mockQuery.mockResolvedValueOnce({ rows:[testpod] } as QueryResult)
//     const res = await request(app).get(`/pods/${testpod.id}`)
//     expect(res.statusCode).toEqual(200)
//     expect(mockQuery).toHaveBeenNthCalledWith(1,
//       "select * from pods where id = $1",
//       [testpod.id])
//   })

//   it('should fail to get a pod', async () => {
//     mockQuery.mockResolvedValueOnce({ rows:[] as unknown } as QueryResult)
//     const res = await request(app).get(`/pods/404`)
//     expect(res.statusCode).toEqual(404)
//     expect(mockQuery).toHaveBeenNthCalledWith(1,
//       "select * from pods where id = $1",
//       ["404"])
//   })

//   it('should patch a pod', async () => {
//     const res = await request(app).patch('/pods/id')
//     expect(res.statusCode).toEqual(200)
//   })

//   it('should delete a pod', async () => {
//     const res = await request(app).delete('/pods/id')
//     expect(res.statusCode).toEqual(200)
//   })
// })