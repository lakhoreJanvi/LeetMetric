document.addEventListener("DOMContentLoaded", function(){

    const userInput = document.getElementById("user-input");
    const searchInput = document.getElementById("search-btn");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById
    ("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-card");

    function validateUserName(username){
        if(username.trim() === ""){
            alert("Username can't be empty.");
            return false;
        }
        const regex = /^[a-zA-Z0-9 _-]{1,15}$/;
        const isMatching = regex.test(username);
        if(!isMatching){
            alert("Invalid user name!");
        }
        return isMatching;
    }

    async function fetchUserDetails(username){

        try{
            searchInput.textContent = "Searching...";
            searchInput.disabled = true;

            const url1 = `https://leetcode-stats-api.herokuapp.com/${username}`;
            const proxyUrl = `https://cors-anywhere.herokuapp.com/`;
            const url2 = `https://leetcode.com/graphql/`;
            
            const response1 = await fetch(url1);
            if(!response1.ok){
                throw new Error("Unable to fetch the user details");
            }
            const parsedData1 = await response1.json();

            displayUserData(parsedData1);

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: "\n   query userSessionProgress($username: String!) {\n  allQuestionsCount {\n   difficulty\n    count\n  }\n   matchedUser(username: $username){\n submitStats {\n acSubmissionNum {\n    difficulty\n    count\n      submissions\n      }\n       totalSubmissionNum{\n   difficulty\n     count\n      submissions\n    }     \n   }  \n   }\n}\n    ",
                variables: { "username": `${username}` }
            })
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow",
            };

            const response2 = await fetch(proxyUrl+url2, requestOptions);
            if (!response2.ok) {
                throw new Error("Unable to fetch user submission stats");
            };
            const parsedData2 = await response2.json();

            displayUserData2(parsedData2);
        }
        catch(error){
            statsContainer.innerHTML = `<p>No data found.</p>`
        }
        finally{
            searchInput.textContent = "Search";
            searchInput.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle){
        const progressDegree = (solved/total)*100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parsedData){
        const totalQues = parsedData.totalQuestions;
        const totalHardQues = parsedData.totalHard;
        const totalMediumQues = parsedData.totalMedium;
        const totalEasyQues = parsedData.totalEasy;

        const totalSolved = parsedData.totalSolved;
        const totalHardSolved = parsedData.hardSolved;
        const totalMediumSolved = parsedData.mediumSolved;
        const totalEasySolved = parsedData.easySolved;

        updateProgress(totalEasySolved, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(totalMediumSolved, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(totalHardSolved, totalHardQues, hardLabel, hardProgressCircle);
    }
    function displayUserData2(parsedData){
        const cardsData = [
            {label: "Overall Submissions", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {label: "Overall Easy Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {label: "Overall Medium Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {label: "Overall Hard Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions},
        ];
        cardStatsContainer.innerHTML = cardsData.map(
            data => 
                    `<div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                    </div>`
        ).join("")
    }
    searchInput.addEventListener('click', function(){
        const username = userInput.value;
        if(validateUserName(username)){
            fetchUserDetails(username);
        }
    })
})