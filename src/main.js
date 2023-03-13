//Data

const API_KEY = "bd23ebc8b269d6891b9b30370c087898";

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
  headers: {
    "Content-Type": "aplication/json;charset=utf-8",
  },
  params: {
    api_key: API_KEY,
    "language": navigator.language || "es-ES"
  },
});

//esta funcion es para devolver las peliculas que tengamos en localStorage
const likedMoviesList = ()=>{
  const item = JSON.parse(localStorage.getItem('liked_movies'))
  let movies

  if (item) {
    movies = item
  }else{
    movies = {}
  }
  return movies

}

const likeMovie = (movie) => {
  
  const likedMovies = likedMoviesList()

  if (likedMovies[movie.id]) {
    likedMovies[movie.id] = undefined
  }else{
    likedMovies[movie.id] = movie
  }

  localStorage.setItem('liked_movies', JSON.stringify(likedMovies))

  getTrendingMoviesPreview()
  getLikedMovies()
}

//utils

const lazyLoader = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const url = entry.target.getAttribute("data-img");
      entry.target.setAttribute("src", url);
    }
  });
});

const createMovies = (
  movies,
  container,
  { lazyLoad = false, clean = true } = {}
) => {
  if (clean) {
    container.innerHTML = ""; //para limpiar
  }

  movies.forEach((movie) => {
    const movieContainer = document.createElement("div");
    movieContainer.classList.add("movie-container");

    const movieImg = document.createElement("img");
    movieImg.classList.add("movie-img");
    movieImg.setAttribute("alt", movie.title);
    movieImg.setAttribute(
      lazyLoad ? "data-img" : "src",
      "https://image.tmdb.org/t/p/w300" + movie.poster_path
    );

    movieImg.addEventListener("click", () => {
      location.hash = "#movie=" + movie.id;
    });
    movieImg.addEventListener("error", () => {
      movieImg.setAttribute(
        "src",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfqkmXguPnY5txActP9NxWbBy5IZ6hPqQdndtXQ8UKuPR-iadsJkrk_FPtPcRO4jkFgj8&usqp=CAU"
      );
    });

    const movieBtn = document.createElement('button')
    movieBtn.classList.add('movie-btn')
    likedMoviesList()[movie.id] && movieBtn.classList.add('movie-btn--liked')
    movieBtn.addEventListener('click',()=>{
      movieBtn.classList.toggle('movie-btn--liked')
      likeMovie(movie)
    })

    if (lazyLoad) {
      lazyLoader.observe(movieImg);
    }
    movieContainer.appendChild(movieImg);
    movieContainer.appendChild(movieBtn);
    container.appendChild(movieContainer);
  });
};

const createCategories = (categories, container) => {
  container.innerHTML = "";

  categories.forEach((category) => {
    const categoryContainer = document.createElement("div");
    categoryContainer.classList.add("category-container");

    const categoryTitle = document.createElement("h3");
    categoryTitle.classList.add("category-title");
    categoryTitle.setAttribute("id", "id" + category.id);

    categoryTitle.addEventListener("click", () => {
      location.hash = `#category=${category.id}-${category.name}`;
    });

    const categoryTitleText = document.createTextNode(category.name);

    categoryTitle.appendChild(categoryTitleText);
    categoryContainer.appendChild(categoryTitle);
    container.appendChild(categoryContainer);
  });
};

//llamados a la api
const getTrendingMoviesPreview = async () => {
  const { data } = await api("trending/movie/day");
  const movies = data.results;

  createMovies(movies, trendingMoviesPreviewList, true);
};

const getMoviesByCategory = async (id) => {
  const { data } = await api("discover/movie", {
    params: {
      with_genres: id,
    },
  });
  const movies = data.results;
  maxPage = data.total_pages

  createMovies(movies, genericSection, {lazyLoad: true});
};

function getPaginatedMoviesByCategory(id) {
  return async () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 15;
    const pageIsNotMax = page < maxPage;

    if (scrollIsBottom && pageIsNotMax) {
      page++;
      const { data } = await api("discover/movie", {
        params: {
          with_genres: id,
          page
        },
      });
      const movies = data.results;
    
      createMovies(movies, genericSection, { lazyLoad: true, clean: false });
    }
  };
}

const getMoviesBySearch = async (query) => {
  const { data } = await api("search/movie", {
    params: {
      query,
    },
  });
  const movies = data.results;
  maxPage = data.total_pages
  console.log(maxPage)

  createMovies(movies, genericSection);
};

function getPaginatedMoviesBySearch(query) {
  return async () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 15;
    const pageIsNotMax = page < maxPage;

    if (scrollIsBottom && pageIsNotMax) {
      page++;
      const { data } = await api("search/movie", {
        params: {
          query,
          page,
        },
      });
      const movies = data.results;

      createMovies(movies, genericSection, { lazyLoad: true, clean: false });
    }
  };
}

const getCategoriesPreview = async () => {
  const { data } = await api("genre/movie/list");
  const categories = data.genres;

  createCategories(categories, categoriesPreviewList);
};

const getTrendingMovies = async () => {
  const { data } = await api("trending/movie/day");
  const movies = data.results;
  maxPage = data.total_pages;

  createMovies(movies, genericSection, { lazyLoad: true, clean: true });
};

async function getPaginatedTrendingMovies() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  const scrollIsBottom = scrollTop + clientHeight >= scrollHeight - 15;
  const pageIsNotMax = page < maxPage;

  if (scrollIsBottom && pageIsNotMax) {
    page++;
    const { data } = await api("trending/movie/day", {
      params: {
        page,
      },
    });
    const movies = data.results;

    createMovies(movies, genericSection, { lazyLoad: true, clean: false });
  }
}

const getMovieById = async (id) => {
  const { data: movie } = await api("movie/" + id);

  const movieImgUrl = "https://image.tmdb.org/t/p/w500" + movie.poster_path;
  // console.log(movieImgUrl)
  headerSection.style.background = `
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.35) 19.27%,
      rgba(0, 0, 0, 0) 29.17%
    ),
    url(${movieImgUrl})
  `;

  movieDetailTitle.textContent = movie.title;
  movieDetailDescription.textContent = movie.overview;
  movieDetailScore.textContent = movie.vote_average;

  createCategories(movie.genres, movieDetailCategoriesList);

  getRelatedMoviesId(id);
};

const getRelatedMoviesId = async (id) => {
  const { data } = await api(`movie/${id}/similar`);
  const relatedMovies = data.results;

  createMovies(relatedMovies, relatedMoviesContainer);
};

const getLikedMovies = ()=>{

  const likedMovies = likedMoviesList()

  const moviesArray = Object.values(likedMovies)

  createMovies(moviesArray,likedMoviesListArticle,{ lazyLoad: true, clean: true })

  console.log(likedMovies)

}
