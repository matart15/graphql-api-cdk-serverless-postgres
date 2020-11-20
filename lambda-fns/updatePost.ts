import Post from './Post'
import { db } from './db'

async function updatePost(post: Post) {
  try {
    const { id, ...rest } = post
    return await db.post.update({ where: { id }, data: rest })
  } catch (err) {
    console.log('Postgres error: ', err)
    return null
  }
}

export default updatePost
