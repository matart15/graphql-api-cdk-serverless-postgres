import { db } from './db'

async function getPostById(postId: string) {
  try {
    return await db.post.findOne({ where: { id: postId } })
  } catch (err) {
    console.log('Postgres error: ', err)
    return null
  }
}

export default getPostById
