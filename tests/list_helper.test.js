const listHelper = require('../utils/list_helper')
const iniHelper = require('./test_helper')


test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {

  const listWithOneBlog = [iniHelper.singleBlog]

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })
})

describe('most likes and blogs', () => {

  const blogs = iniHelper.initialBlogs

  test('which blog has the most likes', () => {
    //console.log(blogs)
    const target = { title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', likes: 12 }
    const result = listHelper.favoriteBlog(blogs)
    expect(result).toEqual(target)
  })

  test('which author has most blogs', () => {
    const target = { author: 'Robert C. Martin', blogs: 3 }
    const result = listHelper.mostBlogs(blogs)
    //console.log(target)
    //console.log(result)
    expect(result).toEqual(target)
  })

  test('which author has most likes', () => {
    const target = { author: 'Edsger W. Dijkstra', likes: 17 }
    const result = listHelper.mostLikes(blogs)
    //console.log(target)
    //console.log(result)
    expect(result).toEqual(target)
  })
})