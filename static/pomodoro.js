document.addEventListener("DOMContentLoaded", function() {

    let is_paused_flag = false;
    let is_stop_flag = true;
    let minute = 25;
    let second = 0;
    let time_start = '';
    let time_end = '';
    let timer_active = !is_paused_flag && !is_stop_flag;

    const t_minute = document.getElementById("minute");
    const t_second = document.getElementById("second");
    const tree = document.querySelector("#current_tree");
    const pause_button = document.querySelector("#btn_pause");
    const stop_button = document.querySelector('#btn_stop');
    const garden_tree_width = Math.floor(tree.clientWidth / 2);
    const garden_tree_height = Math.floor(tree.clientHeight / 2);

    function play_sound(){
        let audio = new Audio('static/bell.wav');
        audio.play();
        console.log('play sound');
    }

    function add_tree(){

        // Get current tree image
        const current_tree_src = tree.src;
        const current_date = new Date();

        // Add new tree to the garden
        let garden_tree = document.createElement("div");
        garden_tree.setAttribute("class", "col d-flex justify-content-center text-center");
        garden_tree.innerHTML = `
            <div class="card shadow-lg">
                <img src="${current_tree_src}" alt="growing tree" class="img-fluid garden_tree" width="${garden_tree_width}px" height="${garden_tree_height}px">
            <div class="card-body p-0 mb-1">
            <p class="card-text">
                <div id="garden_tree_date">
                    ${current_date.toDateString()}
                </div>
                <div id=""garden_tree_time>
                    <span id="garden_tree_time_start">${time_start} - </span>
                    <span id="garden_tree_time_end">${time_end}</span>
                </div>      
            </div>
            </div>
        `;
        document.getElementById("garden").appendChild(garden_tree);

    }

    function tear_down(){
        document.title = "Pomo 25:00";
        tree.src = 'static/tree/1.jpg';
        time_start = '';
        time_end = '';
        minute = 25;
        second = 0;
        t_minute.innerHTML = "25:";
        t_second.innerHTML = "00";
        stop_button.value = "start";
        stop_button.innerHTML = "Start";
        pause_button.value = "pause";
        pause_button.innerHTML = "Pause";
        pause_button.disabled = true;
        is_paused_flag = false;
        timer_active = false;
        console.log('Stop');
    }
    
    setInterval(function() {
        timer_active = !is_paused_flag && !is_stop_flag;
        if (timer_active) {

            // If timer stop by time end or by stop button
            if ((minute === 0 && second === 0) || is_stop_flag) {
                is_stop_flag = true;
                let d = new Date();
                time_end = `${d.getHours()}:${d.getMinutes()}`;
                add_tree();
                play_sound();
                tear_down();
                console.log("stop by timer");
            } else {
                if (second === 0) {
                    minute--;
                    second = 60;
                    tree.src = `static/tree/${26-minute}.jpg`;    
                }
                second--;
                if (minute < 10) {
                    t_minute.innerHTML = `0${minute}:`
                } else {
                    t_minute.innerHTML = `${minute}:`
                }
                if (second < 10) {
                    t_second.innerHTML = `0${second}`;
                } else {
                    t_second.innerHTML = `${second}`;
                }
                document.title = `${t_minute.innerHTML}${t_second.innerHTML}`;
            }
        }
    }, 1000);

    document.querySelector('#btn_stop').addEventListener("click", function(){
        if (this.value === "start") {
            pause_button.disabled = false;
            is_stop_flag = false;
            let d = new Date();
            time_start = `${d.getHours()}:${d.getMinutes()}`;
            this.value = "stop";
            this.innerHTML = "Stop";
        } else {
            is_stop_flag = true;
            pause_button.disabled = true;
            let d = new Date();
            time_end = `${d.getHours()}:${d.getMinutes()}`;
            add_tree();
            play_sound();
            tear_down();
            console.log("stop by button");
        }   
    })

    document.querySelector('#btn_pause').addEventListener("click", function(){
        if (this.value === "pause") {
            is_paused_flag = true;
            this.value = "resume";
            this.innerHTML = "Resume";
        } else {
            is_paused_flag = false;
            this.value = "pause";
            this.innerHTML = "Pause";
        }
    })

});

