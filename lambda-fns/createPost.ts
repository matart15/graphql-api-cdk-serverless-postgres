import Post from './Post'
import * as crypto from 'crypto'
import { getDB } from './db'

async function createPost(post: Post) {
  const db = await getDB()
  if (!post.id) post.id = crypto.randomUUID()
  try {
    return await db.post.create({ data: post })
  } catch (err) {
    console.log('Postgres error: ', err)
    return null
  }
}

export default createPost
