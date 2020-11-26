import { getDB } from './db'

async function listPosts() {
  const db = await getDB()
  try {
    return await db.post.findMany()
  } catch (err) {
    console.log('Postgres error: ', err)
    return null
  }
}

export default listPosts
