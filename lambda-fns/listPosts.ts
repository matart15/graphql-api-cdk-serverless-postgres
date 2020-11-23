import { db } from './db'

async function listPosts() {
  try {
    return await db.post.findMany()
  } catch (err) {
    console.log('Postgres error: ', err)
    return null
  }
}

export default listPosts
