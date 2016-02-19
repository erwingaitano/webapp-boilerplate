function isPrime(n){
    var isPrime = true;
    for (var i = 2; i < n/2+1; i++) {
        if(n%i==0){
            isPrime = false;
            i = n;
        }
    }
    return isPrime;
}

function maxPrime(n){
    n = n || 100;
    var maxPrime = 1;
    
    for (var i = 2; i < n/2+1; i++) {
        if(n%i==0) if(isPrime(i)) maxPrime = i;
    }

    return maxPrime;
}

console.log(maxPrime(600851475143));