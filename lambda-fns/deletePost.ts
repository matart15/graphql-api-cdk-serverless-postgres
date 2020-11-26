import { getDB } from './db'

async function deletePost(postId: string) {
  const db = await getDB()
  try {
    return await db.post.delete({ where: { id: postId } })
  } catch (err) {
    console.log('Postgres error: ', err)
    return null
  }
}

export default deletePost
