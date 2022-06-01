import "./data.js";

mapboxgl.accessToken = "pk.eyJ1IjoiYm9iLXVzZXIiLCJhIjoiY2tycDM0MjE4MGZsejJ1bXcwczNka3hnNSJ9.JlXSoboCjRDRyUaoHDeUSw";
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10'
});

const groupData = (dtg, key) => {
    return dtg.reduce((result, co) => {
        ( result[co[key]] = result[co[key]] || []).push(co);
        return result;
    }, {});
}
const maintab = document.getElementById("side-display");
async function finalRequest() {
    const freq = await fetch("/stopsmk", 
        {
            'method': 'GET',
            'headers': {
                'Access-Control-Allow-Origin': 'http://localhost:8080/',
                'Content-Type': 'application/json',
            }
        }
    );
    if(freq.ok) {
        console.log("/stopsmk request success");
    }
    var data = await freq.json();
    let sort = groupData(data, 'trainId');
    return sort;
}

const toMainHtml = (data, count) => {
    return `<div class="trip-general t${count.toString()}t" id="card">
                <p class="pid t${count.toString()}p">${data[0].trainId}</p>
                <p class="stop t${count.toString()}s">${data[0].stop_name} -> ${data[data.length-1].stop_name}</p>
            </div>`
}

let fcall = finalRequest();
let counter = 0;
fcall.then((data) => {
    let len = Object.keys(data).length;
    Object.keys(data).map((key, index) => {
        maintab.innerHTML += toMainHtml(data[key], counter);
        counter++;
        const divider = document.createElement("div");
        divider.className = "divide";
        maintab.appendChild(divider);
    });
    viewTrip(data);
});

//
const trip = document.getElementById("detail-view");
const btn = document.getElementById("toclose");
trip.style.backgroundColor = `rgb(${1+Math.random()*255}, ${1+Math.random()*255}, ${1+Math.random()*255})`;
trip.style.visibility = 'hidden';

function viewTrip(data) {
    var pids = [...document.querySelectorAll(".pid")];
    let idToGet;
    pids.forEach((pid) => {
        pid.addEventListener("click", (event) => {
            trip.style.visibility = 'visible';
            trip.style.left = "70%";
            trip.style.transition = "1.2s ease";

            idToGet = pid.textContent;
            callback(idToGet);
        })
    });
    btn.onclick = function() {
        trip.style.left = "150%";
        trip.style.transition = '2s ease';
        trip.style.visibility = 'hidden';
    }

    const newCard = document.createElement('div');
    function callback(idToGet) {
        Object.keys(data).map((key, index) => {
            for(let i = 0; i < data[key].length; i++) {
                if(data[key][i].trainId == idToGet) {
                    newCard.innerHTML = 
                    `<div class="card">
                        <p>${idToGet}</p>
                        <p>new value</p>
                        <p>new value</p>
                    </div>`;
                } else {
                    console.log(data[key][i].trainId);
                }
            }
        })
    }
    while(newCard.firstChild) {
        trip.appendChild(newCard.firstChild);
    }
}

//

setInterval(() => {
    let ncall = finalRequest();
    let currentCount = 0;
    ncall.then((data) => {
        Object.keys(data).map((key, index) => {
            let cpid = document.querySelector(`.t${currentCount.toString()}p`);
            let cstop = document.querySelector(`.t${currentCount.toString()}s`);
            if(cpid != null && cstop != null) {
                cpid.innerText = data[key][0].trainId;
                cstop.innerText = data[key][0].stop_name + " -> " + data[key][data[key].length-1].stop_name;
            }
            currentCount++;
        })
    })
}, 15000);