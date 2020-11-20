import { db } from './db'

async function deletePost(postId: string) {
  try {
    return (await db.post.delete({ where: { id: postId } })).id
  } catch (err) {
    console.log('Postgres error: ', err)
    return null
  }
}

export default deletePost
