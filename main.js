import {fetchData} from './lib/fetchData.js';

// your code here
const apiUrl = 'https://media2.edu.metropolia.fi/restaurant/api/v1';
const taulukko = document.querySelector('#target');
const modal = document.querySelector('#modal');
let restaurants = [];
let menuType = 'daily';

document.querySelector('.dailybtn').addEventListener('click', () => {
  menuType = 'daily';
  document.querySelector('.dailybtn').classList.add('active');
  document.querySelector('.weeklybtn').classList.remove('active');
});

document.querySelector('.weeklybtn').addEventListener('click', () => {
  menuType = 'weekly';
  document.querySelector('.weeklybtn').classList.add('active');
  document.querySelector('.dailybtn').classList.remove('active');
});

// html funktiot
function createRestaurantCells(restaurant, tr) {
  // nimisolu
  const nameTd = document.createElement('td');
  nameTd.innerText = restaurant.name;
  // osoitesolu
  const addressTd = document.createElement('td');
  addressTd.innerText = restaurant.address;
  // kaupunkisolu
  const cityTd = document.createElement('td');
  cityTd.innerText = restaurant.city;
  tr.append(nameTd, addressTd, cityTd);
}

function createModalHtml(restaurant, modal) {
  const nameH3 = document.createElement('h3');
  nameH3.innerText = restaurant.name;
  const addressP = document.createElement('p');
  addressP.innerText = `${restaurant.address}, puhelin: ${restaurant.phone}`;
  modal.append(nameH3, addressP);
}

function createMenuHtml(courses) {
  let html = '';
  for (const course of courses) {
    html += `
    <article class="course">
        <p><strong>${course.name}</strong>,
        Hinta: ${course.price},
        Allergeenit: ${course.diets}</p>
    </article>
  `;
  }
  return html;
}

function createWeeklyMenuHtml(days) {
  if (!Array.isArray(days)) {
    return '<p>No weekly menu available.</p>';
  }

  let html = '';
  for (const day of days) {
    if (day.courses && Array.isArray(day.courses)) {
      html += `
      <article class="date">
        <h4><strong>${day.date || 'Unknown date'}</strong></h4>
      `;
      for (const course of day.courses) {
        html += `
        <article class="course">
          <p><strong>${course.name}</strong>,
          Hinta: ${course.price},
          Allergeenit: ${course.diets}</p>
        </article>
        `;
      }
      html += '</article>';
    }
  }
  return html;
}

// hae kaikki ravintolat
async function getRestaurants() {
  try {
    restaurants = await fetchData(apiUrl + '/restaurants');
  } catch (error) {
    console.error(error);
  }
}

// hae tietyn ravintolan päivän menu
async function getDailyMenu(id, lang) {
  try {
    return await fetchData(`${apiUrl}/restaurants/daily/${id}/${lang}`);
  } catch (error) {
    console.error(error);
  }
}

// hae tietyn ravintolan viikon menu
async function getWeeklyMenu(id, lang) {
  try {
    return await fetchData(`${apiUrl}/restaurants/weekly/${id}/${lang}`);
  } catch (error) {
    console.error(error);
  }
}

// restaurants aakkosjärjestykseen
function sortRestaurants() {
  restaurants.sort(function (a, b) {
    return a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1;
  });
}

function createTable() {
  for (const restaurant of restaurants) {
    // rivi
    const tr = document.createElement('tr');
    tr.addEventListener('click', async function () {
      try {
        for (const elem of document.querySelectorAll('.highlight')) {
          elem.classList.remove('highlight');
        }

        tr.classList.add('highlight');

        let coursesResponse;
        if (menuType === 'daily') {
          coursesResponse = await getDailyMenu(restaurant._id, 'fi');
        } else {
          coursesResponse = await getWeeklyMenu(restaurant._id, 'fi');
        }

        // HTML menu luonti viikolle tai päivälle
        const menuHtml =
          menuType === 'daily'
            ? createMenuHtml(coursesResponse.courses)
            : createWeeklyMenuHtml(coursesResponse.days); // Pass 'days' for weekly menu

        // tyhjennetään ja populoidaan html
        modal.innerHTML = '';
        modal.showModal();
        createModalHtml(restaurant, modal);
        modal.insertAdjacentHTML('beforeend', menuHtml);
      } catch (error) {
        console.error(error);
      }
    });

    // lisätään solut riviin
    createRestaurantCells(restaurant, tr);
    taulukko.append(tr);
  }
}
// haetaan ravintoloiden koordinaatit
function getCoordinates(data) {
  return data.map(item => item.location.coordinates);
}

async function main() {
  try {
    await getRestaurants();
    sortRestaurants();
    createTable();
    const coordinates = getCoordinates(restaurants);
    console.log(coordinates);
  } catch (error) {
    console.error(error);
  }
}

main();
