ymaps.ready(init);

function init(){

    let myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 15
    });

    let addMarker = document.getElementById('add-marker');
    let markerContainer = document.getElementById('marker-container');
    let groupMarker = [];
    let myPolyline = null;
    let handler = myMap.geoObjects.events.group();
    let dragSrcEl = null;
    let indexDrag = null;
    let indexDrop = null;
    
    addMarker.addEventListener('keydown', eventKeydownEnter);
    markerContainer.addEventListener('click', eventRemoveMarker);
    markerContainer.addEventListener('dragstart', eventDragstart);
    markerContainer.addEventListener('dragenter', eventDragenter);
    markerContainer.addEventListener('dragover', eventDragover);
    markerContainer.addEventListener('dragleave', eventDragleave);
    markerContainer.addEventListener('drop', eventDrop);
    markerContainer.addEventListener('dragend', eventDragend);

    function eventKeydownEnter(e) {

        if(e.keyCode !== 13) return;

        if(myPolyline !== null) {
            myMap.geoObjects.remove(myPolyline);
        }

        handler.removeAll();

        let newMarker = new ymaps.Placemark(myMap.getCenter(), {
            balloonContent: addMarker.value,
            id: groupMarker.length
        },
        {
            draggable: true
        });

        myMap.geoObjects.add(newMarker);
        groupMarker.push(newMarker);

        createPolyline();
        
        handler.add('drag', function(e) {
            let target = e.get("target");
            let id = target.properties.get("id");
            let newCoords = target.geometry.getCoordinates();
            
            myPolyline.geometry.set(+id, newCoords);
            
        });
        
        let elemLi = document.createElement('li');
        let elemButton = document.createElement('button');

        elemLi.innerHTML = `${addMarker.value}`;
        elemLi.setAttribute("draggable", true);
        elemLi.classList.add("marker-container__item");

        elemButton.innerHTML = 'X';
        elemButton.classList.add("marker-container__button");
        elemButton.cssText = `
            width:10px;
            height:10px;
            font-size:10px;
            border:1px solid black;
        `;
        elemButton.id = `remove-marker-${groupMarker.length - 1}`;

        elemLi.append(elemButton);
        markerContainer.append(elemLi);

        addMarker.value = '';

    }

    function eventRemoveMarker(e) {

        let target = e.target;
        if(target.tagName !== 'BUTTON') return;

        let index = target.id.split('-')[2];
        myMap.geoObjects.remove(groupMarker[index]);
        myMap.geoObjects.remove(myPolyline);

        groupMarker.splice(index,1);
        groupMarker = groupMarker.map((item, i) => {
            item.properties._data.id = i;
            return item;
        });

        markerContainer.children[index].remove();
        for(let item = 0;item < markerContainer.children.length; item++) {
            markerContainer.children[item].querySelector('button').id = `remove-marker-${item}`;
        };

        createPolyline();

    }

    function eventDragstart(e) {

        e.target.style.background = "#ccc";
        dragSrcEl = e.target;
        e.dataTransfer.setData('text/html', e.target.innerHTML);

        let list = Array.from(markerContainer.children);
        list.forEach((item, i) => {
            if(item == e.target) {
                indexDrag = i;
            }
        });
        
    }

    function eventDragenter(e) {

        if(e.target.tagName == "LI") {
            e.target.style.background = "red";
        }

    }

    function eventDragover(e) {

        e.dataTransfer.dropEffect = "move";
        event.returnValue=false;
        return;

    }

    function eventDragleave(e) {

        e.target.style.background = "";

    }

    function eventDrop(e) {

        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        if (dragSrcEl != e.target && e.target.tagName == "LI") {

            let dragId = dragSrcEl.querySelector("button").id;
            let dropId = e.target.querySelector("button").id;
            dragSrcEl.innerHTML = e.target.innerHTML;
            e.target.innerHTML = e.dataTransfer.getData('text/html');
            e.target.style.background = "";
            dragSrcEl.querySelector("button").id = dragId;
            e.target.querySelector("button").id = dropId;
        }

        let list = Array.from(markerContainer.children);
        list.forEach((item, i) => {
            if(item == e.target) {
                indexDrop = i;
            }
        });
        
    }

    function eventDragend(e) {

        e.target.style.background = "";

        if(myPolyline !== null) {
            myMap.geoObjects.remove(myPolyline);
        }

        groupMarker = swap(groupMarker, indexDrag, indexDrop);

        groupMarker = groupMarker.map((item, i) => {
            item.properties._data.id = i;
            return item;
        });

        createPolyline();
        
    }

    function createPolyline() {
        myPolyline = new ymaps.Polyline(groupMarker.map((item) => {
            return item.geometry.getCoordinates();
        }));
        myMap.geoObjects.add(myPolyline);
    }

    function swap (xs, i, j){

        var temp = xs[j];
        xs[j] = xs[i];
        xs[i] = temp;
        return xs;

    }
}