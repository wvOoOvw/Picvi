import PosterEmpty_0 from '../static/image/PosterEmpty_0.jpg'
import PosterEmpty_1 from '../static/image/PosterEmpty_1.jpg'
import PosterEmpty_2 from '../static/image/PosterEmpty_2.jpg'
import PosterEmpty_3 from '../static/image/PosterEmpty_3.jpg'
import PosterEmpty_4 from '../static/image/PosterEmpty_4.jpg'
import PosterEmpty_5 from '../static/image/PosterEmpty_5.jpg'
import PosterEmpty_6 from '../static/image/PosterEmpty_6.jpg'
import PosterEmpty_7 from '../static/image/PosterEmpty_7.jpg'

const images = [
  PosterEmpty_0,
  PosterEmpty_1,
  PosterEmpty_2,
  PosterEmpty_3,
  PosterEmpty_4,
  PosterEmpty_5,
  PosterEmpty_6,
  PosterEmpty_7,
]

const emptyImage = () => {
  return images[Math.floor(Math.random() * images.length)]
}

export { emptyImage }
