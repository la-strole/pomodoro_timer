document.addEventListener("DOMContentLoaded", function() {

    let is_paused_flag = false;
    let is_stop_flag = true;
    let minute = 25;
    let second = 0;
    let time_start = '';
    let time_end = '';
    let breaking_time = false;
    let pomodoro_session = true;
    let pomo_in_row = 0;
    
    const t_minute = document.querySelector("#minute");
    const t_second = document.querySelector("#second");
    const tree = document.querySelector("#current_tree");
    const pause_button = document.querySelector("#btn_pause");
    const stop_button = document.querySelector('#btn_stop');

    function play_sound(){
        let audio = new Audio('static/bell.wav');
        audio.play();
        console.log('play sound');
    }

    function add_tree(){

        // Get current tree image
        const current_tree_src = tree.src;
        const garden_tree_width = Math.floor(tree.clientWidth / 2);
        const garden_tree_height = Math.floor(tree.clientHeight / 2);
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
        console.log('Add tree to the garden');


    }

    function tear_down_pomo(){
        document.title = "Pomodoro 25:00";
        tree.src = 'static/tree/1.jpg';
        time_start = '';
        time_end = '';
        minute = 25;
        second = 0;
        pomo_in_row = 0;
        t_minute.innerHTML = "25:";
        t_second.innerHTML = "00";
        stop_button.value = "start";
        stop_button.innerHTML = "Start";
        pause_button.value = "pause";
        pause_button.innerHTML = "Pause";
        pause_button.disabled = true;
        is_paused_flag = false;
        is_stop_flag = true;
        console.log('Tear down pomo');
    }
    
    function go_to_break(){
        minute = 5;
        second = 0;
        t_minute.innerHTML = "5:";
        t_second.innerHTML = "00";
        pause_button.value = "pause";
        pause_button.innerHTML = "Pause";
        pause_button.disabled = false;
        is_paused_flag = false;
        is_stop_flag = false;
        tree.src = `static/break.jpg`;
        console.log('Go to break');
    }

    function pomo_autostart(){
        document.title = "25:00";
        tree.src = 'static/tree/1.jpg';
        let d = new Date();
        time_start = `${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}`;
        time_end = '';
        minute = 25;
        second = 0;
        t_minute.innerHTML = "25:";
        t_second.innerHTML = "00";
        pause_button.value = "pause";
        pause_button.innerHTML = "Pause";
        pause_button.disabled = false;
        is_paused_flag = false;
        is_stop_flag = false;
        console.log('Autostart pomo');
    }

    function add_pomo_row_card() {
        let row_pomo_card = document.createElement('div');
        row_pomo_card.setAttribute("class", "card");
        row_pomo_card.setAttribute("style", "width: 18rem;");
        row_pomo_card.setAttribute("id", "row_pomo_card");
        row_pomo_card.innerHTML = `
            <div class="card-body">
                <p class="card-text" id="row_pomo_number">
                    ${pomo_in_row} pomodoro in a row
                </p>
            </div>`
        document.getElementById("control_div").appendChild(row_pomo_card);
        console.log('Add row pomo card'); 
    }
    
    add_pomo_row_card();

    setInterval(function() {
        let timer_active = !is_paused_flag && !is_stop_flag;
        
        if (timer_active) {

            // If stoped by timer
            if (minute === 0 && second === 0) {
                // If pomodoro session
                if (pomodoro_session) {
                    if (!breaking_time){
                        play_sound();
                        let d = new Date();
                        time_end = `${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}`;
                        add_tree();
                        pomo_in_row++;
                        document.getElementById("row_pomo_number").innerHTML = `${pomo_in_row}  pomodoro in a row`;
                        go_to_break();
                        breaking_time = true;
                    }
                    else {
                        breaking_time = false;
                        play_sound();
                        console.log("End breaking time");
                        pomo_autostart();
                    }
                }
                else {
                    is_stop_flag = true;
                    let d = new Date();
                    time_end = `${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}`;
                    add_tree();
                    play_sound();
                    tear_down_pomo();
                    console.log("Stop by timer");
                }
            }
            // Timer active
                // To new minute
            if (second === 0) {
                    minute--;
                    second = 60;
                    if (! breaking_time) {
                    tree.src = `static/tree/${26-minute}.jpg`;
                    }
                }
            // Time going
            second--;
            t_minute.innerHTML = ("0" + minute + ":").slice(-3);
            t_second.innerHTML = ("0" + second).slice(-2);
            document.title = `${t_minute.innerHTML}${t_second.innerHTML}`;
        }        
    }, 1000);

    document.querySelector('#btn_stop').addEventListener("click", function(){
        if (this.value === "start") {
            pause_button.disabled = false;
            is_stop_flag = false;
            let d = new Date();
            time_start = `${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}`;
            this.value = "stop";
            this.innerHTML = "Stop";
            pomo_in_row = 0;
            if (pomodoro_session) {
                document.getElementById("row_pomo_number").innerHTML = `${pomo_in_row} pomodoro in a row`;
            }
            console.log("Started by button");
        } else {
            is_stop_flag = true;
            pause_button.disabled = true;
            let d = new Date();
            time_end = `${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}`;
            if (! breaking_time){
                add_tree();
            }
            play_sound();
            tear_down_pomo();
            console.log("Stop by button");
        }   
    })

    document.querySelector('#btn_pause').addEventListener("click", function(){
        if (this.value === "pause") {
            is_paused_flag = true;
            this.value = "resume";
            this.innerHTML = "Resume";
            console.log("Paused by button");
        } else {
            is_paused_flag = false;
            this.value = "pause";
            this.innerHTML = "Pause";
            console.log("Resumed by button");
        }
    })

    document.querySelector('#breaks').addEventListener("change", function(){
        if (this.checked) {
            pomodoro_session = true;
            add_pomo_row_card();
        }
        else {
            pomodoro_session = false;
            document.getElementById("row_pomo_card").remove();
            tear_down_pomo();
        }
        console.log(`swich checked to ${this.checked}`);
    });
});

