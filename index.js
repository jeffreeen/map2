let clusterer

document.addEventListener('DOMContentLoaded', () => {
  ymaps.ready(init);
  function init() {
    const myMap = new ymaps.Map('map', {
      center: [55.76, 37.64],
      controls: ['zoomControl'],
      zoom: 7
    });

    myMap.events.add('click', async function (e) {
      const coords = e.get('coords');
      openBalloon(myMap, coords, []);
    });

    clusterer = new ymaps.Clusterer({ clusterDisableClickZoom: true });
    clusterer.options.set('hasBalloon', false);

    getGeoObjects(myMap)
    clusterer.events.add('click', function(e) {
      let geoObjectsInCluster = e.get('target').getGeoObjects()
      openBalloon(myMap, e.get('coords'), geoObjectsInCluster)
    })

  }
});

function getReviewList(currentGeoObjects) {
  let reviewListHTML = '';
  
  for (const review of getReviewsFromLS()) {
    if (currentGeoObjects.some(geoObject => JSON.stringify(geoObject.geometry._coordinates) === JSON.stringify(review.coords))) {
      reviewListHTML += `
        <div class="review">
          <div><strong>Место: </strong>${review.place}</div>
          <div><strong>Имя: </strong>${review.author}</div>
          <div><strong>Отзыв: </strong>${review.reviewText}</div>
        </div>  
      `;
    }
  }
  return reviewListHTML;
}

function getReviewsFromLS() {
  const reviews = localStorage.reviews
  return JSON.parse(reviews || "[]")
}

function getGeoObjects(map) {
  const geoObjects = []
  for (const review of getReviewsFromLS() || []) {
    const placemark = new ymaps.Placemark(review.coords);
    placemark.events.add('click', e => {
      e.stopPropagation();
      openBalloon(map, e.get('coords'), [e.get('target')])
    })
    geoObjects.push(placemark);
  }

  clusterer.removeAll()
  map.geoObjects.remove(clusterer)
  clusterer.add(geoObjects)
  map.geoObjects.add(clusterer)
}

async function openBalloon(map, coords, currentGeoObjects) {
  await map.balloon.open(coords, {
    content: `<div class="reviews">${getReviewList(currentGeoObjects)}</div>` + formBalloon,
  });
  document.querySelector('#add-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const review = {
      coords,
      author: this.elements.author.value,
      place: this.elements.place.value,
      reviewText: this.elements.review.value,
    };

    localStorage.reviews = JSON.stringify([...getReviewsFromLS(), review])

    getGeoObjects(map)

    map.balloon.close();
  });
}




const formBalloon = `
<form id="add-form">
  <input type="text" placeholder="Название места" name="place"><br><br>
  <input type="text" placeholder="Ваше имя" name="author"><br><br>
  <textarea placeholder="Ваш отзыв" name="review" class="review__text"></textarea><br><br>
  <button id="add-btn">Добавить</button><br>
</form>
`


// const reviews = [];

// document.addEventListener("DOMContentLoaded", () => {
//   ymaps.ready(init);
//   function init(){
//     var myMap = new ymaps.Map("map", {
//         center: [55.76, 37.64],
//         zoom: 7
//     });
//     var saveReviews = JSON.parse(localStorage['reviews']);
//     for (const saveReview of saveReviews) {
//       reviews.push(saveReview);
//       const geoObj = new ymaps.GeoObject({
//         geometry: {type: 'Point' , coordinates: saveReview.coords},
//       });
//       myMap.geoObjects.add(geoObj);
//       addCluster(myMap, saveReview.coords);
//     }
//     myMap.events.add('click', function (e) {
//       var coords = e.get('coords');
//       openBalloon(myMap, coords);
//     });
//   }
// });





// function getOptionsCluster(coords) {
//   const clusterOjects = [];
//   for (const review of reviews) {
//     if (JSON.stringify(review.coords) === JSON.stringify(coords)) {
//       const geoObj = new ymaps.GeoObject({
//         geometry: {type: 'Point' , coordinates: coords}
//       })
//       clusterOjects.push(geoObj);
//     }
//   }
//   return clusterOjects;
// };

// function addCluster(map, coords) {
//   var myClusterer = new ymaps.Clusterer({clusterDisableClickZoom: true});
//   myClusterer.options.set('hasBalloon', false);

//   function addToCluster() {
//     const myGeoObjects = getOptionsCluster(coords);
//     myClusterer.add(myGeoObjects);
//     map.geoObjects.add(myClusterer);
//     map.balloon.close();
//   }

//   myClusterer.events.add('click', function(e) {
//     e.preventDefault();
//     openBalloon(map, coords, myClusterer, addToCluster);
//   })

//   addToCluster();
// }

// function getReviewList(coords) {
//   var reviewListHTML = '';
//   for (const review of reviews) {
//     if (JSON.stringify(review.coords) === JSON.stringify(coords)) {
//       reviewListHTML += `
//         <div class="review">
//           <div><strong>Место: </strong> ${review.place}</div>
//           <div><strong>Автор: </strong> ${review.author}</div>
//           <div><strong>Отзыв: </strong> ${review.reviewText}</div>
//         </div>`
//     }
//   }
//   return reviewListHTML
// }

// async function openBalloon(map, coords, myClusterer, fn) {
//   await map.balloon.open(coords, {
//     content: `<div class="review__container">${getReviewList(coords)}</div>${formBalloon}`
//   })
//   document.querySelector('#add-form').addEventListener("submit", function(e) {
//     if (myClusterer) {
//       myClusterer.removeAll();
//     }
//     e.preventDefault();
//     reviews.push({
//       coords: coords,
//       author: this.elements.author.value,
//       place: this.elements.place.value,
//       reviewText: this.elements.review.value,
//     })
//     localStorage['reviews'] = JSON.stringify(reviews);
//     console.log(localStorage['reviews']);
//     !fn ? addCluster(map, coords) : fn()
//     map.balloon.close()
//   })
// }










// const formBalloon = `
// <form id="add-form">
//   <input type="text" placeholder="Название места" name="place"><br><br>
//   <input type="text" placeholder="Ваше имя" name="author"><br><br>
//   <textarea placeholder="Ваш отзыв" name="review" class="review__text"></textarea><br><br>
//   <button id="add-btn">Добавить</button><br>
// </form>`