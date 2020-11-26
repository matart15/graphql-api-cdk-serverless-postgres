import { getDB } from './db'
import Post from './Post'

async function updatePost(post: Post) {
  const db = await getDB()
  try {
    const { id, ...rest } = post
    return await db.post.update({ where: { id }, data: rest })
  } catch (err) {
    console.log('Postgres error: ', err)
    return null
  }
}

export default updatePost
