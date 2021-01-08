
const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((accum, current) => accum + current.likes, 0)
}

const favoriteBlog = (blogs) => {
  //console.log('Blogs: ', blogs)

  let maxIndex = blogs.reduce((maxIndex, current, curIndex, arr) =>  
    arr[maxIndex].likes > current.likes ? maxIndex : curIndex, 0)
  let item = blogs[maxIndex]
  let result = { title: item.title, author: item.author, likes: item.likes }
  //console.log(result)
  return result
}

const mostBlogs = (blogs) => {
  //console.log('Blogs: ', blogs)

  let blogCounts = {} 
  
  let maxAuthor = blogs[0].author

  blogs.forEach(element => {
    let author = element.author
    if (author in blogCounts) {
      blogCounts[author] +=1
      if (blogCounts[author] > blogCounts[maxAuthor]) {
        maxAuthor = author
      }
    } else {
      blogCounts[author] = 1
    }
  })

  //console.log('max: ', maxAuthor)
  //console.log('Blog counts: ', blogCounts)
  return { author: maxAuthor, blogs: blogCounts[maxAuthor] }
}

const mostLikes = (blogs) => {

  let likes = {}
  let maxAuthor = blogs[0].author

  blogs.forEach(element => {
    let author = element.author

    if(author in likes) {
      likes[author] += element.likes
      if(likes[author] > likes[maxAuthor]) {
        maxAuthor = author
      }
    } else {
      likes[author] = element.likes
    }
  })
  return { author: maxAuthor, likes: likes[maxAuthor] }
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}