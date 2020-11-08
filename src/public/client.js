const Map = Immutable.Map;
const List = Immutable.List;

const API = "http://localhost:3000";

let store = Map({
  rovers: List(),
  selectedRover: null
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
  state = store.merge(newState);
  render(root, state);
}

const render = async (root, state) => {
  root.innerHTML = App(state);
  addEventListeners(state);
}

const addEventListeners = state => {
  let rovers = state.get('rovers').toJS();
  rovers.forEach(rover => {
    const navItemEl = document.getElementById(`nav-${rover.name}`);
    navItemEl.addEventListener('click', () => {
      updateStore(state, { selectedRover: Map(rover) });
    })
  })
}

// create content
const App = (state) => {
  let rovers = state.get('rovers').toJS();
  let selectedRover = state.get('selectedRover') ? state.get('selectedRover').toJS() : null;
  return `
    <div class="bg-img ${selectedRover ? 'blurred' : ''}"></div>
    <div class="content">
      ${selectedRover ? SelectedRover(selectedRover) : ''}
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

const SelectedRover = ({ name, status, landing_date, launch_date, max_date, cameras }) => {
  return `
    <div class="selected-rover">
      <h2 class="rover-title">${name}</h2>
      <div class="rover-info">
        ${RoverStat({ title: 'Status', stat: status })}
        ${RoverStat({
        title: 'Cameras', stat: cameras.map(camera => `
          <p>${camera.full_name}</p>
          `).join("")
        })}
        <div class="rover-stats">
          ${RoverStat({ title: 'Launch date', stat: launch_date })}
          ${RoverStat({ title: 'Landing date', stat: landing_date })}
          ${RoverStat({ title: 'Last mission', stat: max_date })}
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

// ------------------------------------------------------  API CALLS

fetch(`${API}/rovers`)
  .then(res => res.json())
  .then(rovers => {
    updateStore(store, { rovers: List(rovers) });
  })