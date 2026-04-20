.PHONY: build dev clean push

build:
	python3 scripts/data_exporter.py
	python3 scripts/corpus_stats.py
	cp -r src dist
	cp data/*.json dist/data/

dev:
	python3 -m http.server 8080

clean:
	rm -rf dist

push: build
	cd dist && git add .
	cd dist && git commit -m "docs: update data $(date '+%Y-%m-%d %H:%M')"
	cd dist && git push origin gh-pages
