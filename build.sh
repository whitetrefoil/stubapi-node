#!/usr/bin/env bash

error () {
  echo "Error: $1"
  exit ${2:-1}
}

pre_build () {
  npm install
}

build () {
  npm run build
}

ut () {
  npm run coverage
}

lint () {
  npm run gulp -- eslint --ci
}

if [[ -z `which npm` ]]; then error "npm not found"; fi

case $1 in
  pre_build)
    pre_build
    ;;
  build)
    build
    ;;
  ut)
    ut
    ;;
  lint)
    lint
    ;;
  *)
    error "Usage: ./build.sh (pre_build|build|ut|lint)"
esac
