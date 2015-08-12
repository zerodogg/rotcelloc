{
    "//":"See README.md for configuration instructions",
    "menuSiteTitle":"My Rotcelloc-collection",
    "maxMoviesPerRenderedPage":100,
    "maxMoviesPerRenderedPageMobile":40,
    "language":"en",
    "collections": {
        "My Movies":{
            "type":"movies",
            "sources": [
                {
                    "file":"animation.csv",
                    "name":"Animation",
                    "disneySort":true
                },
                {
                    "file":"otherMovies.csv",
                    "name":"Other movies"
                }
            ]
        },
        "My TV series":{
            "type":"series",
            "sources":[
                {
                    "file": "series.csv",
                    "name":"Series"
                }
            ]
        },
        "My Games":{
            "type":"games",
            "defaultSort":"year",
            "sources": [
                {
                    "name": "My Steam account",
                    "source":"steam",
                    "user":"MYSTEAMACCOUNT"
                },
                {
                    "name": "My physical games",
                    "file": "games.csv",
                }
            ]
        }
    }
}
