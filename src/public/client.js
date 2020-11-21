// @ts-check

const Map = Immutable.Map;
const List = Immutable.List;

const API = "http://localhost:3000";

let store = Map({
  isLoading: true,
  rovers: List(),
  selectedRover: null,
  selectedPhoto: null
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
  const state = store.merge(newState);
  render(root, state);
}

const render = async (root, state) => {
  root.innerHTML = App(state);
  addEventListeners(state);
  addSlideshowListener(state);
}

const addEventListeners = state => {
  let rovers = state.get('rovers').toJS();
  rovers.forEach((rover, i) => {
    const navItemEl = document.getElementById(`nav-${rover.name}`);
    navItemEl.addEventListener('click', () => {
      let selectedPhoto;
      const roverPhotos = rover.photos && rover.photos.toJS();
      if (roverPhotos && roverPhotos.length > 0) {
        selectedPhoto = Map(roverPhotos[0]).set('currentIndex', 0);
      }
      updateStore(state, { selectedRover: Map(rover), selectedPhoto });
      if (!roverPhotos || roverPhotos.length == 0) {
        setTimeout(() => {
          fetch(`${API}/rovers/${rover.name}?date=${rover.max_date}`)
            .then(res => res.json())
            .then(photos => {
              let rovers = state.get('rovers');
              photos = List(photos.map(photo => Map(photo)));
              let rover = { ...rovers.get(i), photos };
              rovers = rovers.set(i, rover);
              updateStore(state, { selectedRover: Map(rover), rovers, selectedPhoto: Map(photos.get(0)).set('currentIndex', 0) });
            })
        }, 1);
      }
    })
  })


}

const addSlideshowListener = state => {
  const getNextPhoto = (dir, state) => {
    let nextIndex = state.get('selectedPhoto').get('currentIndex') + dir;
    const photos = state.getIn(['selectedRover', 'photos']);
    let nextPhoto = photos.get(nextIndex);
    if (!nextPhoto) {
      nextIndex = 0;
      nextPhoto = photos.get(nextIndex);
    }
    if (nextIndex < 0) nextIndex = photos.size + nextIndex;
    nextPhoto = nextPhoto.set('currentIndex', nextIndex);
    return nextPhoto;
  }

  const addSlideshowBtnListener = (buttonId, dir, state) => {
    const buttonEl = document.getElementById(buttonId);
    if (buttonEl) {
      buttonEl.addEventListener('click', () => {
        const nextPhoto = getNextPhoto(dir, state);
        updateStore(state, Map({ selectedPhoto: nextPhoto }))
      })
    }
  }

  addSlideshowBtnListener('next-rover-pic', 1, state);
  addSlideshowBtnListener('prev-rover-pic', -1, state);
}

// create content
const App = (state) => {
  let rovers = state.get('rovers').toJS();
  let selectedRover = state.get('selectedRover') ? state.get('selectedRover').toJS() : null;
  let selectedPhoto = state.get('selectedPhoto') ? state.get('selectedPhoto').toJS() : null;
  const isLoading = state.get('isLoading');
  return `
    ${!selectedRover ? `<h1 class="mars ${isLoading ? 'animated' : 'loaded'}">Mars</h2>` : '' }
    <div class="bg-img ${selectedRover ? 'blurred' : ''}"></div>
    <div class="content">
      ${selectedRover ? SelectedRover({ selectedRover, selectedPhoto }) : ''}
      ${NavMenu(rovers)}
    </div>
    <footer></footer>
  `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
  render(root, store)
})

// ------------------------------------------------------  COMPONENTS

const Rover = ({ name, status, total_photos }) => {
  return `
    <div id=rover-${name}>
      <p>${name}</p>
      <p>Status: ${status}</p>
      <p>Total photos: ${total_photos}</p>
    </div>
  `;
}

const NavMenu = (rovers) => {
  return `
    <nav class="nav-menu">
      <ul>
        ${rovers.map(rover => NavMenuItem(rover)).join('')}
      </ul>
    </nav>
  `;
}

const NavMenuItem = ({ name }) => {
  return `
    <li id="nav-${name}">${name}</li>
  `;
}

const SelectedRover = ({ selectedRover, selectedPhoto }) => {
  const { name, status, landing_date, launch_date, max_date, cameras, photos } = selectedRover;
  return `
    <div class="selected-rover">
      <h2 class="rover-title">${name}</h2>
      <div class="rover-content">
        <div class="rover-info">
          ${RoverStat({ title: 'Status', stat: status })}
          ${RoverStat(
    {
      title: 'Cameras',
      stat: cameras.map(camera => `<p>${camera.full_name}</p>`).join("")
    })
    }
          <div class="rover-stats">
            ${RoverStat({ title: 'Launch date', stat: launch_date })}
            ${RoverStat({ title: 'Landing date', stat: landing_date })}
            ${RoverStat({ title: 'Last mission', stat: max_date })}
          </div>
        </div>
        <div class="rover-photos">
          ${selectedPhoto ? RoverPhotosSlideshow({ selectedPhoto, totalPhotos: photos.length }) : ''}
        </div>
      </div>
    </div>
  `;
}

const RoverStat = ({ title, stat }) => {
  return `
    <div class="rover-stat">
      <p class="rover-stat-title">${title}</p>
      <div class="rover-stat-value">${stat}</div>
    </div>
  `;
}

const RoverPhotosSlideshow = ({ selectedPhoto, totalPhotos }) => {
  return `
    <div class="rover-slideshow">
      <p class="slideshow-total">${selectedPhoto.currentIndex + 1}/${totalPhotos}</p>
      <img src="${selectedPhoto.img_src}" />
      <p class="slideshow-camera">${selectedPhoto.camera.full_name}</p>
      <button class="slideshow-nav previous" id="prev-rover-pic">←</button>
      <button class="slideshow-nav next" id="next-rover-pic">→</button>
    </div>
  `;
}

// ------------------------------------------------------  API CALLS

fetch(`${API}/rovers`)
  .then(res => res.json())
  .then(rovers => {
    setTimeout(() => {
      updateStore(store, { rovers: List(rovers), isLoading: false });
    }, 1500);
  })