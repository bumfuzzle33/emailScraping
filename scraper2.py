import requests








#use puppeteer , normal method not working


searchText = "arts"
number_of_articles = 10
articlesUrl = f'https://journals.sagepub.com/action/doSearch?field1=AllField&text1={searchText}&publication=&Ppub=&access=&pageSize={number_of_articles}&AfterYear=2014&BeforeYear=2023&queryID=14%2F1651925948&startPage=0&sortBy=FullEpubDateField'

articleLinksList = []
getArticleUrls = requests.get(url = articlesUrl)
resArticleText = getArticleUrls.text

print(resArticleText)







