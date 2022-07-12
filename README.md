# Salsify Sr. Backend Software Engineer Assignment - Line Server Problem

### Installation and usage

- `build.sh` runs `npm install`, you can download the source, `cd` into the main directory and just run `npm install` and ignore `build.sh`. If you want to run the version with Redis, then make sure you have Redis installed and simply do `node index_with_redis.js <path to data file>` instead (again, after doing `npm install`)

- IF you want to run the Redis version and do not have Redis installed then:

  - `docker pull redis`
  - `docker run --name line-reader-redis -p 6379:6379 -d redis`
  - you may need to do the `docker run` above with `sudo`

- `run.sh` launches the app as specified, please provide your data file as a command-line argument, for example if the test file is `boston_food.csv`:
  - `./run.sh boston_food.csv`
  - I used a Boston Food Inspection dataset available [here](https://data.boston.gov/dataset/03693648-2c62-4a2c-a4ec-48de2ee14e18/resource/4582bec6-2b4f-4f9e-bc55-cbaa73117f4c/download/tmplc21byhd.csv), this csv file has 709153 lines.

### Q&A

- How does your system work? (if not addressed in comments in source)

I examined two slightly different approaches to this problem. These are contained in `index.js` and `index_with_redis.js`. They are essentially the same, with the exception of how the data from the processed text file is stored. With `index.js`, the processed data is stored in a simple JavaScript object with each line number as key and line text as value. With smaller source files (my sample data file, `boston_food.csv` is 276.4 MB), my limited testing indicates this is around 10% more performant than the `index_with_redis.js` version that utilizes Redis to store the processed data. If this server needed to process and serve more than 1 or 2GB of data I would look at loading the data into a Postgres database and use Redis for caching.

As is, `index.js` is a simple Express server. The data file is processed (synchronously) and the server accepts and fills requests asynchronously. Run locally, I have tested 100 VUs (virtual users) with the `k6` load testing tool (again, my test data file, `boston_food.csv` is 276.4 MB and around 709K lines) with the following results:

```txt
          /\      |‾‾| /‾‾/   /‾‾/
     /\  /  \     |  |/  /   /  /
    /  \/    \    |     (   /   ‾‾\
   /          \   |  |\  \ |  (‾)  |
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: script.js
     output: -

  scenarios: (100.00%) 1 scenario, 100 max VUs, 1m0s max duration (incl. graceful stop):
           * default: 100 looping VUs for 30s (gracefulStop: 30s)


running (0m30.0s), 000/100 VUs, 551325 complete and 0 interrupted iterations
default ✓ [======================================] 100 VUs  30s

     data_received..................: 341 MB 11 MB/s
     data_sent......................: 51 MB  1.7 MB/s
     http_req_blocked...............: avg=1.08µs  min=0s       med=0s     max=5.09ms  p(90)=1µs    p(95)=1µs
     http_req_connecting............: avg=508ns   min=0s       med=0s     max=3.31ms  p(90)=0s     p(95)=0s
     http_req_duration..............: avg=5.42ms  min=96µs     med=5.04ms max=33.03ms p(90)=7.1ms  p(95)=7.69ms
       { expected_response:true }...: avg=5.42ms  min=96µs     med=5.04ms max=33.03ms p(90)=7.1ms  p(95)=7.69ms
     http_req_failed................: 0.00%  ✓ 0            ✗ 551325
     http_req_receiving.............: avg=10.92µs min=3µs      med=7µs    max=9.58ms  p(90)=11µs   p(95)=13µs
     http_req_sending...............: avg=2.4µs   min=1µs      med=2µs    max=6.73ms  p(90)=3µs    p(95)=3µs
     http_req_tls_handshaking.......: avg=0s      min=0s       med=0s     max=0s      p(90)=0s     p(95)=0s
     http_req_waiting...............: avg=5.41ms  min=90µs     med=5.03ms max=33.02ms p(90)=7.08ms p(95)=7.67ms
     http_reqs......................: 551325 18372.418801/s
     iteration_duration.............: avg=5.43ms  min=108.08µs med=5.06ms max=33.12ms p(90)=7.12ms p(95)=7.71ms
     iterations.....................: 551325 18372.418801/s
     vus............................: 100    min=100        max=100
     vus_max........................: 100    min=100        max=100
```

This is hitting the endpoint with a random line number.

How will your system perform with a 1 GB file? a 10 GB file? a 100 GB file?
This system is constrained by RAM. Both overall RAM on the machine and the RAM allocated to Node.js. As noted above. To make this API server more robust I would implement a database and cache.

How will your system perform with 100 users? 10000 users? 1000000 users?
I could only test 100 VUs with my current hardware. To test more users I would deploy this solution on AWS or Digital Ocean and use a serverless framework for scalable API load testing like this one: [Artemis](https://artemis-load-testing.github.io/), which is also my last project. :) This can test up to 20000 VUs. Again, if we are dealing with larger datasets I would implement a DB and cache. If the dataset is static (as this one seems to be)... meaning we are only performing writes during initial processing, then scaling the data storage seems less complicated.

What documentation, websites, papers, etc did you consult in doing this assignment?

- [n-readlines](https://www.npmjs.com/package/n-readlines)
- [redis docs](https://redis.io/docs/)
- [node-redis](https://github.com/redis/node-redis)
- [MDN](https://developer.mozilla.org/en-US/)
- a few random youtube videos for more Redis context/usage
- some on my own older code/projects to refresh my memory on JS, async/await, and Express

What third-party libraries or other tools does the system use? How did you choose each library or framework you used?

- Express, simple and relatively robust, I have used it before
- Redis, I have not used Redis, and I spent probably more time than I should have researching it, but I was happy to get exposure to a cool, widely used tool
- n-readlines, I used this specifically because it was synchronous since I wanted the server blocked until the input file was read in and processed.

How long did you spend on this exercise? If you had unlimited more time to spend on this, how would you spend it and how would you prioritize each item?

- 12-15 hours, much of it looking at Redis and testing its performance in this application as a simple data store alternative to just using a JS object.
- if I were to spend more time I would research and implement a DB and cache solution and deploy it on AWS and then test it more vigorously.

If you were to critique your code, what would you have to say about it?

- I think it is clear and readable. Some things like using a separate `config` file to hold some env values might be a bit of overkill, but I like the modularity. If I were to keep working on this I would probably extract the `processFile` functionality to a separate file as well. I also wonder if that functionality could be made more performant.

Last note:

- obviously, this is the product of my current thinking without outside collaboration, in a team setting I would have reached out a few times along the way to confirm assumptions and get other perspectives. I am very open to the possibility that there may be much better approaches here. :)
